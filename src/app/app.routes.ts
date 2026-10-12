import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./modules/home/home').then(m => m.Home) },
    { path: 'timesheet', loadComponent: () => import('./modules/timesheet/timesheet').then(m => m.Timesheet) },
    { path: 'projects', loadComponent: () => import('./modules/projects/projects').then(m => m.Projects) },
];
