import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';

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
    path: 'teams',
    loadComponent: () => import('./teams/teams.component').then((m) => m.TeamsComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/components/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/components/register/register.component').then((m) => m.RegisterComponent)
  },
  {
    path: 'me',
    loadComponent: () => import('./auth/components/me/me.component').then((m) => m.MeComponent),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'standings',
    pathMatch: 'full'
  }
];
