import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MicroRecorderService {

  private mediaRecorder!: MediaRecorder;
  private audioChunks: Blob[] = [];

  // Démarre l’enregistrement micro
  async startRecording(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    this.audioChunks = [];
    this.mediaRecorder = new MediaRecorder(stream);

    this.mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start();
  }

  // Arrête l’enregistrement et renvoie le fichier audio
  async stopRecording(): Promise<Blob> {
    return new Promise(resolve => {
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, {
          type: 'audio/wav',
        });

        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }
}
