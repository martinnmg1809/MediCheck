import { Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register';
import { LoginComponent } from './components/login/login';
import { ForgotComponent } from './components/forgot-password/forgot-password';
import { HomeComponent } from './components/home/home';
import { ListaTomasComponent } from './components/lista-tomas/lista-tomas.component';
import { FormularioTomaComponent } from './components/formulario-toma/formulario-toma.component';
import { ResetComponent } from './components/formulario-reset-password/reset-password';
import { authGuard, publicGuard } from './guard/guard';
import { EditarTratamiento } from './components/editar-tratamiento/editar-tratamiento';
import { Historial } from './components/historial/historial';
// ── NUEVOS ──────────────────────────────────────────────────────
import { RegistrarSintomasComponent } from './components/registrar-sintomas/registrar-sintomas';
import { VerSintomasComponent }       from './components/ver-sintomas/ver-sintomas';

export const routes: Routes = [
    { path: '',                   redirectTo: 'login', pathMatch: 'full' },
    { path: 'home',               component: HomeComponent,               canActivate: [authGuard] },
    { path: 'register',           component: RegisterComponent, canActivate: [publicGuard] },
    { path: 'login',              component: LoginComponent,    canActivate: [publicGuard] },
    { path: 'create',             component: FormularioTomaComponent },
    { path: 'list',               component: ListaTomasComponent },
    { path: 'forgot-password',    component: ForgotComponent },
    { path: 'form-new-password',  component: ResetComponent },
    { path: 'editar-tratamiento/:id', component: EditarTratamiento },
    { path: 'historial',          component: Historial },
    // ── NUEVAS RUTAS ────────────────────────────────────────────
    { path: 'registrar-sintomas', component: RegistrarSintomasComponent, canActivate: [authGuard] },
    { path: 'ver-sintomas',       component: VerSintomasComponent,        canActivate: [authGuard] }
];