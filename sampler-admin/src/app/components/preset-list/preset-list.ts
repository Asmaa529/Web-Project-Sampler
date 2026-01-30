import { Component, OnInit } from '@angular/core';
import { AdminServices } from '../../services/admin.services';
import { Preset } from '../../models/preset.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-preset-list',
  imports: [CommonModule],
  templateUrl: './preset-list.html',
  styleUrl: './preset-list.css',
})
export class PresetList implements OnInit{
  presets: Preset[] = [];

  constructor(private adminServices: AdminServices, private router: Router){}

  ngOnInit(){
    // recupere tous les presets, au chargement du composant
    this.loadAllPresets();
  }

  loadAllPresets(){
    this.adminServices.getPresets().subscribe((preset) => this.presets = preset);
  }

  // Renomme un preset + recharge la liste
  onRename(preset: Preset, newName: string){
    this.adminServices.renamePreset(preset.name, newName).subscribe(() => this.loadAllPresets());
  }

  // Supprime un preset + recharge la liste
  onDelete(presetName: string){
    this.adminServices.deletePreset(presetName).subscribe(() => this.loadAllPresets());
  }
}
