import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Sound } from '../models/sound.model';
import { Preset } from '../models/preset.model';

@Injectable({
  providedIn: 'root',
})
export class AdminServices {
  private readonly apiURL = 'http://localhost:3001/api/presets';

  constructor(private http: HttpClient) {}

  // recupere la liste complete des presets
  getPresets(): Observable<Preset[]> {
    return this.http.get<Preset[]>(this.apiURL);
  }

  // renomme un preset existant
  renamePreset(oldName: string, newName: string): Observable<any> {
    const encodedName = encodeURIComponent(oldName);
    return this.http.put(`${this.apiURL}/${encodedName}`, { name: newName });
  }

  // supprime un preset
  deletePreset(name: string): Observable<any>{
    return this.http.delete(`${this.apiURL}/${name}`);
  }

  // cree un nouveau preset avec ses fichiers audio
  uploadNewPreset(formData: FormData): Observable<any>{
    return this.http.post(`${this.apiURL}`, formData);
  }

  // recupere tous les sons existants de toutes les categories
  getSounds(): Observable<Sound[]> {
    return this.http.get<Sound[]>(`${this.apiURL}/sounds`);
  }

  // supprime plusieurs sons
  deleteSounds(sounds: Sound[]): Observable<any> {
    // Support numeric ids and fallback to url/name for legacy presets
    const identifiers = sounds.map(snd => {
      if (snd.id !== undefined && snd.id !== null) return snd.id;
      if (snd.url) return snd.url;
      if (snd.name) return snd.name;
      return JSON.stringify(snd);
    });
    return this.http.request('delete', `${this.apiURL}/sounds`, { body: { ids: identifiers } });
  }

}