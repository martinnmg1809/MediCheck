import { Routes } from '@angular/router';
import { RegisterComponent } from './components/register';
import { LoginComponent } from './components/login';
import { App } from './app';

import { ListaTomasComponent } from './components/lista-tomas.component';
import { FormularioTomaComponent } from './components/formulario-toma.component';
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
    },
    // 2. AGREGAMOS LA RUTA '/crear'
    {
        path: 'create',
        component: FormularioTomaComponent
    },
    {
        path: 'list',
        component: ListaTomasComponent
    }
];