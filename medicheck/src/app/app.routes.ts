import { Routes } from '@angular/router';
import { RegisterComponent } from './components/register';
import { LoginComponent } from './components/login';
import { App } from './app';

export const routes: Routes = [
    {
        path: '',
        component: App,
        pathMatch: 'full'
    },
    { 
        path : 'register', 
        component: RegisterComponent 
    },
    {
        path : 'login',
        component: LoginComponent
    }
];
