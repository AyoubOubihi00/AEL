import { Component, computed, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Contrat } from '../../core/modeles/contrat';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-menu-lateral',
  standalone: true,
  imports: [CommonModule, MatListModule, RouterModule],
  templateUrl: './menu-lateral.component.html',
  styleUrl: './menu-lateral.component.css',
})
export class MenuLateralComponent {
  private router = inject(Router);
  @Input({ required: true }) contrats: Contrat[] = [];

  private urlSignal = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly contratActif = computed(() => {
    const match = this.urlSignal().match(/\/contrats\/([^/]+)/);
    return match ? match[1] : null;
  });

}
