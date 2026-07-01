import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { RecordatoriosService } from './services/recordatorios.service';
import { App as CapApp } from '@capacitor/app';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('medicheck');

  constructor(
    private recordatoriosService: RecordatoriosService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.recordatoriosService.init();
      this.manejarDeepLinks();
    }
  }

  private manejarDeepLinks(): void {
    // Captura el token cuando la app se abre fría desde un deep link
    CapApp.getLaunchUrl().then((result) => {
      if (result?.url) this.navegarDesdeUrl(result.url);
    });

    // Captura el token cuando la app ya está abierta y llega un deep link
    CapApp.addListener('appUrlOpen', (data) => {
      this.navegarDesdeUrl(data.url);
    });
  }

  private navegarDesdeUrl(url: string): void {
    try {
      // medicheck://form-new-password?token=abc123
      const partes = url.split('?');
      const params = new URLSearchParams(partes[1] ?? '');
      const token = params.get('token');
      const ruta = partes[0].split('://')[1] ?? '';

      if (ruta.startsWith('form-new-password') && token) {
        this.router.navigate(['/form-new-password'], { queryParams: { token } });
      }
    } catch (e) {
      console.error('Deep link inválido:', e);
    }
  }
}
