import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { clearSessionData, hasValidSession } from '../../utils/session';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  isMenuOpen = false;
  isAuthPage = false;

  private readonly authRoutes = ['/login', '/register', '/forgot-password', '/form-new-password'];

  constructor(private router: Router) {
    this.syncAuthPageState(this.router.url);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.syncAuthPageState(event.urlAfterRedirects);
      }
    });
  }

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

  private syncAuthPageState(url: string): void {
    const normalizedUrl = url.split('?')[0].split('#')[0];
    this.isAuthPage = this.authRoutes.includes(normalizedUrl);
  }
}