import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminServices } from '../../services/admin.services';
import { Sound } from '../../models/sound.model';
import { Preset } from '../../models/preset.model';

import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-delete-sound',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatSelectModule, MatFormFieldModule, RouterLink],
  templateUrl: './delete-sound.html',
  styleUrl: './delete-sound.css',
})
export class DeleteSound implements OnInit {
  presets: Preset[] = [];
  selectedPreset: Preset | null = null;
  selectedSounds: Sound[] = [];

  constructor(private adminService: AdminServices, private router: Router){}

  ngOnInit(){
    // recupere tous les presets, au chargement du composant
    this.loadAllPresets();
  }

  loadAllPresets(){
    this.adminService.getPresets().subscribe((preset) => this.presets = preset);
  }

  onPresetSelected(preset: Preset){
    // Si on change de preset, le tableau de sons est vide
    this.selectedPreset = preset;
    this.selectedSounds = [];
  }

  // genere une cle unique pour un son
  private sampleKey(sound: Sound): string | number {
    if(sound.id){
      return sound.id;
    }else if(sound.url){
      return sound.url;
    }else if(sound.name){
      return sound.name;
    }else{
      // serialise l'objet
      return JSON.stringify(sound);
    }
  }

  // verifie si un son est deja selectionne dans la liste
  isSoundSelected(sound: Sound): boolean {
    const key = this.sampleKey(sound);
    return this.selectedSounds.some((snd) => this.sampleKey(snd) === key);
  }

  // ajoute/retire un son de la liste
  onToggleSoundSelection(sound: Sound){
    const key = this.sampleKey(sound);
    const isInTab = this.selectedSounds.some((snd) => this.sampleKey(snd) === key);
    if(isInTab){
      this.selectedSounds = this.selectedSounds.filter((snd) => this.sampleKey(snd) !== key);
    }else{
      this.selectedSounds.push(sound);
    }
  }

  // supprime tous les sons selectionnes
  onDeleteSelectedSounds(){
    if(!this.selectedPreset || this.selectedSounds.length === 0){
      return;
    }
    this.adminService.deleteSounds(this.selectedSounds).subscribe(()=>{
      this.loadAllPresets();
      this.selectedPreset = null;
      this.selectedSounds = [];
    });
  }



}