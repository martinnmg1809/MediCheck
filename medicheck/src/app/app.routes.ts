import { Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register';
import { LoginComponent } from './components/login/login';
import { App } from './app';
import { ForgotComponent } from './components/forgot-password/forgot-password';
import { HomeComponent } from './components/home/home'; 
import { ListaTomasComponent } from './components/lista-tomas/lista-tomas.component';
import { FormularioTomaComponent } from './components/formulario-toma/formulario-toma.component';
import { ResetComponent } from './components/formulario-reset-password/reset-password';
import { profile } from 'console';
export const routes: Routes = [
    {
        path: '', //RUTA RAIZ, equivalente al perfil
        component: HomeComponent,
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
    },
    {
        path: 'forgot-password',
        component: ForgotComponent
    },
    {
        path: 'form-new-password',
        component: ResetComponent
    }
];