import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent)
  },
  // Protected routes
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },
  {
    path: 'financial',
    loadComponent: () => import('./features/financial/financial').then(m => m.Financial),
    canActivate: [authGuard]
  },
  {
    path: 'inventory',
    loadComponent: () => import('./features/inventory/inventory').then(m => m.Inventory),
    canActivate: [authGuard]
  },
  {
    path: 'documents',
    loadComponent: () => import('./features/documents/documents').then(m => m.Documents),
    canActivate: [authGuard]
  },
  {
    path: 'accounts',
    loadComponent: () => import('./features/accounts/accounts').then(m => m.Accounts),
    canActivate: [authGuard]
  },
  {
    path: 'insurance',
    loadComponent: () => import('./features/insurance/insurance').then(m => m.Insurance),
    canActivate: [authGuard]
  },
  {
    path: 'bills',
    loadComponent: () => import('./features/bills/bills').then(m => m.Bills),
    canActivate: [authGuard]
  },
  {
    path: 'maintenance',
    loadComponent: () => import('./features/maintenance/maintenance').then(m => m.Maintenance),
    canActivate: [authGuard]
  },
  // Catch all - redirect to login
  {
    path: '**',
    redirectTo: 'login'
  }
];
