import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject, firstValueFrom } from 'rxjs';

import { Sound } from '../models/sound.model';

@Injectable({
  providedIn: 'root',
})
export class AudioService {

  private audioContext = new AudioContext();
  private readonly serverURL = 'http://localhost:3001';

  // Sons actuellement chargés
  chosenSounds: Sound[] = [];
  progressSoundLoaded = new Subject<number>();

  constructor(private http: HttpClient) {}

  // ---- Presets ----

  async getPresets(): Promise<any[]> {
    return firstValueFrom(
      this.http.get<any[]>(`${this.serverURL}/api/presets`)
    );
  }

  async loadSoundsFromPreset(selectedPreset: any): Promise<Sound[]> {
    if (!selectedPreset) return [];

    // Support des deux formats de preset
    const samples = Array.isArray(selectedPreset.samples)
      ? selectedPreset.samples
      : Array.isArray(selectedPreset.sounds)
      ? selectedPreset.sounds
      : [];

    if (samples.length === 0) {
      this.chosenSounds = [];
      return [];
    }

    const names = samples.map(
      (s: any, idx: number) =>
        s.name ?? s.title ?? `sound-${idx}`
    );

    let totalSounds = samples.length;
    let loadedSounds = 0;
    const decodedBuffers: AudioBuffer[] = [];

    for (const sound of samples) {
      try {
        const urlRaw = sound.url || sound.path || '';
        const cleanUrl = urlRaw.startsWith('./')
          ? urlRaw.substring(2)
          : urlRaw;

        const cleanedUrl = cleanUrl.includes('/')
          ? `${this.serverURL}/presets/${encodeURI(cleanUrl)}`
          : `${this.serverURL}/${encodeURI(cleanUrl)}`;

        const response = await fetch(cleanedUrl);

        if (!response.ok) {
          loadedSounds++;
          this.progressionSoundLoaded(
            Math.round((loadedSounds / totalSounds) * 100)
          );
          continue;
        }

        const buffer = await response.arrayBuffer();
        const decoded =
          await this.audioContext.decodeAudioData(buffer);

        decodedBuffers.push(decoded);
        loadedSounds++;

        this.progressionSoundLoaded(
          Math.round((loadedSounds / totalSounds) * 100)
        );
      } catch {
        loadedSounds++;
        this.progressionSoundLoaded(
          Math.round((loadedSounds / totalSounds) * 100)
        );
      }
    }

    const soundObjects: Sound[] = decodedBuffers.map(
      (buffer, i) => ({
        id: Date.now() + i,
        name: names[i] ?? `sound-${i}`,
        audioBuffer: buffer,
        startTime: 0,
        endTime: buffer.duration,
        isPlaying: false,
        playbackSpeed: 1.0,
        volume: 1.0,
        loop: false,
        category:
          selectedPreset.name ??
          selectedPreset.category ??
          'Unknown',
        activeNode: undefined,
      })
    );

    this.chosenSounds = soundObjects;

    return soundObjects.sort(
      (a, b) =>
        this.getSoundOrder(a.name) -
        this.getSoundOrder(b.name)
    );
  }

  // ---- Décodage ----

  async decodedAudioFile(
    file: File,
    categorySound: string
  ): Promise<Sound> {
    const buffer = await file.arrayBuffer();
    const decodedBuffer =
      await this.audioContext.decodeAudioData(buffer);

    return {
      id: Date.now(),
      name: file.name.split('.').slice(0, -1).join('.'),
      audioBuffer: decodedBuffer,
      startTime: 0,
      endTime: decodedBuffer.duration,
      isPlaying: false,
      playbackSpeed: 1.0,
      volume: 1.0,
      loop: false,
      category: categorySound,
      activeNode: undefined,
    };
  }

  async decodeRecordedBlob(
    blob: Blob,
    category = 'Micro'
  ): Promise<Sound> {
    const arrayBuffer = await blob.arrayBuffer();
    const decodedBuffer =
      await this.audioContext.decodeAudioData(arrayBuffer);

    return {
      id: Date.now(),
      name: 'Mic_' + new Date().toLocaleTimeString(),
      audioBuffer: decodedBuffer,
      startTime: 0,
      endTime: decodedBuffer.duration,
      isPlaying: false,
      playbackSpeed: 1.0,
      volume: 1.0,
      loop: false,
      category,
      activeNode: undefined,
    };
  }

  // ---- Lecture ----

  play(sound: Sound): AudioBufferSourceNode {
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = sound.audioBuffer;
    source.playbackRate.value = sound.playbackSpeed;
    gainNode.gain.value = sound.volume;
    source.loop = sound.loop;

    if (source.loop) {
      source.loopStart = sound.startTime;
      source.loopEnd = sound.endTime;
    }

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const start = Math.max(0, sound.startTime);
    const end = Math.min(
      sound.audioBuffer.duration,
      sound.endTime
    );

    source.start(
      0,
      start,
      sound.loop ? undefined : end - start
    );

    return source;
  }

  /**
   * Update playback rate of a given AudioBufferSourceNode.
   * If smooth is true, apply a short linear ramp for a smoother transition.
   */
  setPlaybackRate(node: AudioBufferSourceNode, rate: number, smooth = false) {
    try {
      const t = this.audioContext.currentTime;
      if (smooth) {
        node.playbackRate.cancelScheduledValues(t);
        node.playbackRate.setValueAtTime(node.playbackRate.value, t);
        node.playbackRate.linearRampToValueAtTime(rate, t + 0.1);
      } else {
        node.playbackRate.setValueAtTime(rate, t);
      }
    } catch (err) {
      // Fallback for older browsers
      try {
        (node.playbackRate as any).value = rate;
      } catch {}
    }
  }

  // ---- Gestion ----

  getLoadedSounds(): Observable<Sound[]> {
    return of(this.chosenSounds);
  }

  getAllPresets(): Observable<Sound[]> {
    return of(this.chosenSounds);
  }

  progressionSoundLoaded(percent: number) {
    this.progressSoundLoaded.next(percent);
  }

  addSound(sound: Sound): Observable<string> {
    this.chosenSounds.push(sound);
    return of('Sound Added');
  }

  deleteSound(sound: Sound): Observable<string> {
    this.chosenSounds = this.chosenSounds.filter(
      snd => snd.id !== sound.id
    );
    return of('Sound Deleted');
  }

  updateSound(sound: Sound): Observable<string> {
    this.chosenSounds = this.chosenSounds.map(
      snd => (snd.id === sound.id ? sound : snd)
    );
    return of('Sound Updated');
  }

  getSoundById(
    id: number
  ): Observable<Sound | undefined> {
    const found = this.chosenSounds.find(
      sound => sound.id === id
    );
    return of(found);
  }

  // Ordre des instruments
  private getSoundOrder(name: string): number {
    const n = name.toLowerCase();
    if (n.includes('kick') || n.includes('bd')) return 1;
    if (n.includes('snare') || n.includes('sd')) return 2;
    if (n.includes('clap') || n.includes('rim')) return 3;
    if (n.includes('hat') || n.includes('ch') || n.includes('oh')) return 4;
    return 10;
  }

  // Test simple
  async runHeadlessTest(): Promise<void> {
    const presets = await this.getPresets();
    if (presets && presets.length > 0) {
      const sounds =
        await this.loadSoundsFromPreset(presets[0]);

      for (const s of sounds) {
        this.play(s);
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }
}
