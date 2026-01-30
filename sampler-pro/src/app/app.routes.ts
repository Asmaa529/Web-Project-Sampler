import { Routes } from '@angular/router';
import { Sampler } from './components/sampler/sampler';

export const routes: Routes = [
    {path: '', redirectTo: '/home', pathMatch: 'full'},
    {path: 'home', component: Sampler},
];
