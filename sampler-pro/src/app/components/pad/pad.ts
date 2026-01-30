import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

import { Sound } from '../../models/sound.model';

@Component({
  selector: 'app-pad',
  imports: [CommonModule, MatButtonModule],
  templateUrl: './pad.html',
  styleUrl: './pad.css',
})
export class Pad {

  // Son associé au pad
  @Input() sound!: Sound;

  // Événement envoyé au parent
  @Output() selected = new EventEmitter<Sound>();

  onPlay() {
    this.selected.emit(this.sound);
  }

}
