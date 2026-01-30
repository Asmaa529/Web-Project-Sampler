import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Sound } from '../../models/sound.model';
import { Pad } from '../pad/pad';
import { Waveform } from '../waveform/waveform';

import { AudioService } from '../../services/audio.services';
import { MicroRecorderService } from '../../services/micro-recorder.service';

import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';

const KEYS = [
  '1', '2', '3', '4',
  'a', 'z', 'e', 'r',
  'q', 's', 'd', 'f',
  'w', 'x', 'c', 'v',
];

@Component({
  selector: 'app-sampler',
  standalone: true,
  imports: [
    CommonModule,
    Pad,
    Waveform,
    MatSelectModule,
    MatFormFieldModule,
    MatSliderModule,
    FormsModule,
    MatProgressBarModule,
  ],
  templateUrl: './sampler.html',
  styleUrl: './sampler.css',
})
export class Sampler implements OnInit {

  presets: any[] = [];
  sounds: Sound[] = [];

  selectedSound: Sound | null = null;
  lastPlayTime: number = 0;

  isDragging: boolean = false;
  isRecording: boolean = false;

  progressSoundLoaded: number = 0;

  constructor(
    private audioService: AudioService,
    private microRecorder: MicroRecorderService,
    private router: Router
  ) {
    this.audioService.progressSoundLoaded.subscribe(progress => {
      this.progressSoundLoaded = progress;
    });
  }

  async ngOnInit() {
    try {
      this.presets = await this.audioService.getPresets();
    } catch (err) {
      console.error('Erreur presets:', err);
    }
  }

  // ---- Clavier ----

  @HostListener('window:keydown', ['$event'])
  onKeyPressed(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    const index = KEYS.indexOf(key);

    if (!isNaN(index) && index >= 0 && index < this.sounds.length) {
      const soundToPlay = this.sounds[index];
      this.handleSoundPlay(soundToPlay);
      this.selectedSound = soundToPlay;
    }
  }

  // ---- Presets / Sounds ----

  async onPresetSelected(value: string) {
    const selectedPreset = this.presets.find(p => p.name === value);

    if (selectedPreset) {
      this.sounds = await this.audioService.loadSoundsFromPreset(selectedPreset);
      this.selectedSound = this.sounds.length > 0 ? this.sounds[0] : null;
    }
  }

  addSoundToSampler(sound: Sound) {
    this.sounds.push(sound);
    this.audioService.addSound(sound);
  }

  // ---- Drag & Drop ----

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  async onDrop(event: DragEvent) {
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (this.sounds.length < 20 && file.type.startsWith('audio/')) {
        const sound = await this.audioService.decodedAudioFile(
          file,
          'User Imports'
        );

        this.sounds.push(sound);
        this.selectedSound = sound;
      }
    }
  }

  // ---- Lecture ----

  handleSoundPlay(sound: Sound) {
    if (sound.activeNode) {
      try {
        sound.activeNode.stop();
      } catch {}
    }

    sound.activeNode = this.audioService.play(sound);
    this.lastPlayTime = Date.now();
    this.selectedSound = sound;

    sound.isPlaying = true;
    setTimeout(() => {
      sound.isPlaying = false;
    }, 150);
  }

  runHeadlessTest() {
    this.audioService.runHeadlessTest();
  }

  // ---- Enregistrement micro ----

  async startRecording() {
    this.isRecording = true;
    await this.microRecorder.startRecording();
  }

  async stopRecording() {
    this.isRecording = false;

    const blob = await this.microRecorder.stopRecording();
    const sound = await this.audioService.decodeRecordedBlob(blob, 'Micro');

    this.sounds.push(sound);
    this.selectedSound = sound;
  }
}
