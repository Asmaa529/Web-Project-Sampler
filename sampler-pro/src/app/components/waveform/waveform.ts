import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatSliderModule } from '@angular/material/slider';
import { MatCheckbox } from '@angular/material/checkbox';

import { Sound } from '../../models/sound.model';
import { AudioService } from '../../services/audio.services';

/* ---------- Utils ---------- */

function distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt(
    (x2 - x1) * (x2 - x1) +
    (y2 - y1) * (y2 - y1)
  );
}

/* ---------- Trim bars drawer ---------- */
// Fichier trimbardrawer.js converti en TypeScript
class TrimbarsDrawer {

  leftTrimBar = { x: 0, color: 'white', selected: false, dragged: false };
  rightTrimBar = { x: 0, color: 'white', selected: false, dragged: false };

  playheadX: number = -1;

  private ctx: CanvasRenderingContext2D;

  constructor(
    private canvas: HTMLCanvasElement,
    leftX: number,
    rightX: number
  ) {
    this.leftTrimBar.x = leftX;
    this.rightTrimBar.x = rightX;
    this.ctx = canvas.getContext('2d')!;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  draw() {
    const ctx = this.ctx;

    ctx.save();
    ctx.lineWidth = 2;

    // Ligne gauche
    ctx.strokeStyle = this.leftTrimBar.color;
    ctx.beginPath();
    ctx.moveTo(this.leftTrimBar.x, 0);
    ctx.lineTo(this.leftTrimBar.x, this.canvas.height);
    ctx.stroke();

    // Ligne droite
    ctx.strokeStyle = this.rightTrimBar.color;
    ctx.beginPath();
    ctx.moveTo(this.rightTrimBar.x, 0);
    ctx.lineTo(this.rightTrimBar.x, this.canvas.height);
    ctx.stroke();

    // Playhead
    ctx.strokeStyle = 'yellow';
    ctx.beginPath();
    ctx.moveTo(this.playheadX, 0);
    ctx.lineTo(this.playheadX, this.canvas.height);
    if (this.playheadX > 0 && this.playheadX < this.canvas.width) {
      ctx.stroke();
    }

    // Triangle gauche
    ctx.fillStyle = this.leftTrimBar.color;
    ctx.beginPath();
    ctx.moveTo(this.leftTrimBar.x, 0);
    ctx.lineTo(this.leftTrimBar.x + 10, 8);
    ctx.lineTo(this.leftTrimBar.x, 16);
    ctx.fill();

    // Triangle droit
    ctx.fillStyle = this.rightTrimBar.color;
    ctx.beginPath();
    ctx.moveTo(this.rightTrimBar.x, 0);
    ctx.lineTo(this.rightTrimBar.x - 10, 8);
    ctx.lineTo(this.rightTrimBar.x, 16);
    ctx.fill();

    // Zones grisées
    ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
    ctx.fillRect(0, 0, this.leftTrimBar.x, this.canvas.height);
    ctx.fillRect(
      this.rightTrimBar.x,
      0,
      this.canvas.width,
      this.canvas.height
    );

    ctx.restore();
  }

  startDrag() {
    if (this.leftTrimBar.selected) this.leftTrimBar.dragged = true;
    if (this.rightTrimBar.selected) this.rightTrimBar.dragged = true;
  }

  stopDrag() {
    this.leftTrimBar.dragged = false;
    this.rightTrimBar.dragged = false;
  }

  highLightTrimBarsWhenClose(mousePos: { x: number; y: number }) {
    let d = distance(
      mousePos.x,
      mousePos.y,
      this.leftTrimBar.x + 5,
      4
    );

    if (d < 15 && !this.rightTrimBar.selected) {
      this.leftTrimBar.color = 'red';
      this.leftTrimBar.selected = true;
    } else {
      this.leftTrimBar.color = 'white';
      this.leftTrimBar.selected = false;
    }

    d = distance(
      mousePos.x,
      mousePos.y,
      this.rightTrimBar.x - 5,
      4
    );

    if (d < 15 && !this.leftTrimBar.selected) {
      this.rightTrimBar.color = 'red';
      this.rightTrimBar.selected = true;
    } else {
      this.rightTrimBar.color = 'white';
      this.rightTrimBar.selected = false;
    }
  }

  moveTrimBars(mousePos: { x: number; y: number }) {
    this.highLightTrimBarsWhenClose(mousePos);

    if (this.leftTrimBar.dragged && mousePos.x < this.rightTrimBar.x) {
      this.leftTrimBar.x = Math.max(0, mousePos.x);
    }

    if (this.rightTrimBar.dragged && mousePos.x > this.leftTrimBar.x) {
      this.rightTrimBar.x = Math.min(this.canvas.width, mousePos.x);
    }
  }
}

/* ---------- Waveform drawer ---------- */
// Fichier waveformdrawer.js converti en TypeScript
class WaveformDrawer {

  private decodedAudioBuffer!: AudioBuffer;
  private peaks!: Float32Array;
  private canvas!: HTMLCanvasElement;

  private displayWidth!: number;
  private displayHeight!: number;
  private sampleStep!: number;
  private color!: string;

  init(
    decodedAudioBuffer: AudioBuffer,
    canvas: HTMLCanvasElement,
    color: string,
    sampleStep?: number
  ) {
    this.decodedAudioBuffer = decodedAudioBuffer;
    this.canvas = canvas;
    this.displayWidth = canvas.width;
    this.displayHeight = canvas.height;
    this.color = color;
    this.sampleStep = sampleStep || 0;

    this.getPeaks();
  }

  private max(values: Float32Array): number {
    let max = -Infinity;

    for (let i = 0; i < values.length; i++) {
      if (values[i] > max) {
        max = values[i];
      }
    }

    return max;
  }

  drawWave(startY: number, height: number) {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);
    ctx.translate(0, startY);

    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;

    const width = this.displayWidth;
    const maxPeak = this.max(this.peaks);
    const coef = height / (2 * (maxPeak || 1));
    const halfH = height / 2;

    // Ligne centrale
    ctx.beginPath();
    ctx.moveTo(0, halfH);
    ctx.lineTo(width, halfH);
    ctx.stroke();

    // Onde
    ctx.beginPath();
    ctx.moveTo(0, halfH);

    for (let i = 0; i < width; i++) {
      const h = Math.round(this.peaks[i] * coef);
      ctx.lineTo(i, halfH + h);
    }

    for (let i = width - 1; i >= 0; i--) {
      const h = Math.round(this.peaks[i] * coef);
      ctx.lineTo(i, halfH - h);
    }

    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private getPeaks() {
    const buffer = this.decodedAudioBuffer;
    const sampleSize = Math.ceil(buffer.length / this.displayWidth);

    this.sampleStep = this.sampleStep || ~~(sampleSize / 10);

    const channels = buffer.numberOfChannels;
    this.peaks = new Float32Array(this.displayWidth);

    for (let c = 0; c < channels; c++) {
      const chan = buffer.getChannelData(c);

      for (let i = 0; i < this.displayWidth; i++) {
        const start = ~~(i * sampleSize);
        const end = start + sampleSize;
        let peak = 0;

        for (let j = start; j < end; j += this.sampleStep) {
          const value = chan[j];
          if (Math.abs(value) > peak) {
            peak = Math.abs(value);
          }
        }

        this.peaks[i] += peak / channels;
      }
    }
  }
}

/* ---------- Component ---------- */

@Component({
  selector: 'app-waveform',
  imports: [
    CommonModule,
    MatSliderModule,
    FormsModule,
    MatCheckbox,
  ],
  templateUrl: './waveform.html',
  styleUrl: './waveform.css',
})
export class Waveform implements AfterViewInit, OnChanges {

  @Input() activeSound: Sound | null = null;
  @Input() lastPlayTime: number = 0;

  @ViewChild('waveformCanvas')
  waveformCanvas!: ElementRef<HTMLCanvasElement>;

  @ViewChild('overlayCanvas')
  overlayCanvas!: ElementRef<HTMLCanvasElement>;

  private drawer = new WaveformDrawer();
  private trimDrawer!: TrimbarsDrawer;

  private playStartTime: number = 0;
  private animationFrameId: number = 0;

  constructor(private audioService: AudioService) {}

  ngAfterViewInit() {
    // On vérifie si l'élément existe bien dans le DOM
    if (this.overlayCanvas && this.overlayCanvas.nativeElement) {
      const overlay = this.overlayCanvas.nativeElement;
      this.trimDrawer = new TrimbarsDrawer(overlay, 0, overlay.width - 2);
      this.trimDrawer.draw();
    }
  }

  ngOnChanges(changes: any) {
    if (this.activeSound && this.waveformCanvas && this.overlayCanvas) {
      // Si le trimDrawer n'existe pas encore
      if (!this.trimDrawer && this.overlayCanvas.nativeElement) {
        const overlay = this.overlayCanvas.nativeElement;
        this.trimDrawer = new TrimbarsDrawer(overlay, 0, overlay.width - 2);
      }

      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }

      this.draw();
      this.playStartTime = performance.now();
      this.animate();
    }
  }

  private draw() {
    if (!this.activeSound) return;

    const canvas = this.waveformCanvas?.nativeElement;
    if (!canvas) return;

    this.drawer.init(this.activeSound.audioBuffer, canvas, '#00ff00');
    this.drawer.drawWave(0, canvas.height);
  }

  animate() {
    if (!this.trimDrawer) {
      return;
    }

    this.trimDrawer.clear();
    this.updatePlayhead();
    this.trimDrawer.draw();

    const elapsed = performance.now() - this.playStartTime;
    const duration = this.activeSound!.audioBuffer.duration * 1000;
    const speed = this.activeSound!.playbackSpeed;
    const adjustedDuration = duration / speed;
    const progress = elapsed / adjustedDuration;

    if (!this.activeSound?.loop && progress >= 1) {
      this.trimDrawer.playheadX = -1;
      this.trimDrawer.clear();
      this.trimDrawer.draw();
      return;
    }

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  updatePlayhead() {
    if (!this.activeSound || !this.trimDrawer) return;

    const elapsed = performance.now() - this.playStartTime;
    const duration = this.activeSound.audioBuffer.duration * 1000;
    const speed = this.activeSound.playbackSpeed;
    const adjustedDuration = duration / speed;

    let progress = elapsed / adjustedDuration;

    if (this.activeSound.loop) {
      progress = (elapsed % adjustedDuration) / adjustedDuration;
    } else if (progress >= 1) {
      this.trimDrawer.playheadX = -1;
      this.trimDrawer.clear();
      this.trimDrawer.draw();
      return;
    }

    this.trimDrawer.playheadX =
      this.trimDrawer.leftTrimBar.x +
      progress *
        (this.trimDrawer.rightTrimBar.x - this.trimDrawer.leftTrimBar.x);
  }

  toggleLoop() {
    if (!this.activeSound) return;

    this.activeSound.loop = !this.activeSound.loop;

    if (this.activeSound.activeNode) {
      this.activeSound.activeNode.loop = this.activeSound.loop;
    }
  }

  // Gère le changement de vitesse en ajustant le modèle, la lecture et la position logique de la tête
  onPlaybackSpeedChange(newSpeed: number) {
    if (!this.activeSound) return;

    // Met à jour le modèle
    this.activeSound.playbackSpeed = newSpeed;

    const node = this.activeSound.activeNode;
    if (!node) return;

    // Calculer la durée du segment découpé
    const segStart = this.activeSound.startTime;
    const segEnd = this.activeSound.endTime;
    const segDur = Math.max(0.0001, segEnd - segStart); // seconds

    // Ancienne vitesse provenant du nœud
    let oldSpeed;

    if (node.playbackRate && node.playbackRate.value != null) {
      oldSpeed = node.playbackRate.value;
    } else {
      oldSpeed = newSpeed;
    }


    // Calculer la progression actuelle dans le segment découpé
    const elapsed = performance.now() - this.playStartTime; // ms
    const oldAdjustedSegDurationMs = (segDur * 1000) / (oldSpeed || 1);

    let progress = elapsed / oldAdjustedSegDurationMs;
    if (this.activeSound.loop) {
      progress = (elapsed % oldAdjustedSegDurationMs) / oldAdjustedSegDurationMs;
    }

    // Nouvelle durée ajustée et mise à jour de playStartTime
    const newAdjustedSegDurationMs = (segDur * 1000) / newSpeed;
    this.playStartTime = performance.now() - progress * newAdjustedSegDurationMs;

   // Appliquer la nouvelle vitesse de lecture
    this.audioService.setPlaybackRate(node, newSpeed, true);
  }

  onMouseDown() {
    if (!this.trimDrawer) return;
    this.trimDrawer.startDrag();
  }

  onMouseMove(event: MouseEvent) {
    if (!this.trimDrawer) return;

    const rect =
      this.overlayCanvas.nativeElement.getBoundingClientRect();

    const mousePos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    this.trimDrawer.moveTrimBars(mousePos);
    this.trimDrawer.clear();
    this.trimDrawer.draw();
  }

  onMouseUp() {
    if (!this.trimDrawer || !this.activeSound) return;

    this.trimDrawer.stopDrag();

    const width = this.overlayCanvas.nativeElement.width;

    const ratioLeft = this.trimDrawer.leftTrimBar.x / width;
    const ratioRight = this.trimDrawer.rightTrimBar.x / width;

    this.activeSound.startTime =
      ratioLeft * this.activeSound.audioBuffer.duration;

    this.activeSound.endTime =
      ratioRight * this.activeSound.audioBuffer.duration;
  }
}
