import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [], // <-- Permite usar routerLink en el HTML de este componente
  templateUrl: './home.html',
  styleUrl: '../../app.css' // O el archivo de estilos que prefieras referenciar
})
export class HomeComponent {}