import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { clearSessionData, hasValidSession } from '../../utils/session';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css' // <-- ¡Esta es la línea clave que conecta el diseño!
})
export class NavbarComponent {
  isMenuOpen: boolean = false;

  constructor(private router: Router) {}

  get isLoggedIn(): boolean {
    return hasValidSession();
  }

  onLogout(): void {
    clearSessionData();
    this.router.navigate(['/login']);
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }
}