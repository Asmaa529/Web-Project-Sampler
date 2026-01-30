import { Routes } from '@angular/router';
import { AddSound } from './components/add-sound/add-sound';
import { DeleteSound } from './components/delete-sound/delete-sound';
import { PresetList } from './components/preset-list/preset-list';

export const routes: Routes = [
    { path: 'add-sound', component: AddSound },
    { path: 'delete-sound', component: DeleteSound },
    { path: 'preset-list', component: PresetList}
];