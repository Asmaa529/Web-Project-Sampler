import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AudioService } from './services/audio.services';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  presetHasLoaded = false;

  constructor(private audioService: AudioService){
    this.audioService.progressSoundLoaded.subscribe(progress =>{
      if(progress > 0){
        this.presetHasLoaded = true;
      }
    })
  }
}
