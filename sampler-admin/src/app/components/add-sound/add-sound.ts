import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminServices } from '../../services/admin.services';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-add-sound',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, RouterLink],
  templateUrl: './add-sound.html',
  styleUrl: './add-sound.css',
})
export class AddSound {
  selectedFiles: File[] = []; // fichier audio sélectionné par l'utilisateur
  newSound: any = {name: '', category: 'User import'}; // infos du nouveau son à ajouter

  constructor(private adminService: AdminServices, private router: Router){}

  // Utilisateur sélectionne le/les fichier(s) audio
  onFileSelected(event: any){
    const files = event.target.files;
    this.selectedFiles = Array.from(files as File[])
                              .filter((file: File) => file && file.type && file.type.startsWith('audio/'));
  }

  // Active/Desactive bouton validation
  isSubmitDisabled(){
    if(this.selectedFiles.length === 0 || (this.selectedFiles.length === 1 && !this.newSound.name) || !this.newSound.category ){
      return true;
    }

    return false;
  }

  // Crée le preset avec les sons selectionnes
  async onAdd() {
    if (this.selectedFiles.length > 0 && this.newSound.name) {

      // Crée un objet FormData pour envoyer des données + fichiers au backend
      const formData = new FormData();
      formData.append('name', this.newSound.name);
      formData.append('category', this.newSound.category);

      this.selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      this.adminService.uploadNewPreset(formData).subscribe(() =>{
        // une fois le preset cree, on retourne sur la liste des presets
        this.router.navigate(['/preset-list']);
      });

    }
  }
}