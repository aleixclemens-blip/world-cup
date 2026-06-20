import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'standings',
    loadComponent: () => import('./standings/standings.component').then((m) => m.StandingsComponent)
  },
  {
    path: 'results',
    loadComponent: () => import('./results/results.component').then((m) => m.ResultsComponent)
  },
  {
    path: '',
    redirectTo: 'standings',
    pathMatch: 'full'
  }
];
