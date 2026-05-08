import { Routes } from '@angular/router';
import { RegisterComponent } from './components/register';
import { App } from './app';

export const routes: Routes = [
    { 
        path : 'register', 
        component: RegisterComponent 
    },
    {
        path: '',
        component: App,
        pathMatch: 'full'
    }
];
