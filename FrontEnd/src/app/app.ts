import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { AuthService } from './service/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatToolbarModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private authService = inject(AuthService);
  private router = inject(Router);

  private urlSignal = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly themeDark = signal(false);

  readonly estConnecte = computed(() => !!this.authService.utilisateurSignal());
  readonly estPageAuth = computed(() => {
    const url = this.urlSignal();
    return url.startsWith('/connexion') || url.startsWith('/inscription') || url === '/';
  });

  constructor() {
    const saved = localStorage.getItem('ael-theme');
    if (saved === 'dark') {
      this.themeDark.set(true);
    }
  }

  toggleTheme() {
    const next = !this.themeDark();
    this.themeDark.set(next);
    localStorage.setItem('ael-theme', next ? 'dark' : 'light');
  }

  deconnexion() {
    this.authService.deconnexion();
    this.router.navigateByUrl('/connexion');
  }
}
