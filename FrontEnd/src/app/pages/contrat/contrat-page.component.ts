import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, computed } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuLateralComponent } from '../../features/menu-lateral/menu-lateral.component';
import { AuthService } from '../../service/auth.service';
import { ContratService } from '../../service/contrat.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-page-contrat',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatSidenavModule,
    MatTableModule,
    MatTabsModule,
    MenuLateralComponent,
  ],
  templateUrl: './contrat-page.component.html',
  styleUrl: './contrat-page.component.css',
})
export class ContratPageComponent {
  private authService = inject(AuthService);
  private contratService = inject(ContratService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly contrat = this.contratService.contratActifSignal;
  readonly contrats = this.contratService.contratsSignal;
  readonly graphiqueConsommation = this.contratService.graphiqueConsommationSignal;
  readonly colonnesFactures = ['reference', 'amount', 'date'];
  readonly urlGraphique = computed(() => {
    const data = this.graphiqueConsommation();
    if (!data.labels.length) {
      return '';
    }
    const couleurs = ['#f26b8a', '#4aa3df', '#42c3b6'];
    const datasets = data.series.map((serie, index) => ({
      label: serie.label,
      data: serie.data,
      backgroundColor: couleurs[index % couleurs.length],
      stack: 'stack1',
    }));
    const config = {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets,
      },
      options: {
        legend: { position: 'top' },
        scales: {
          xAxes: [{ stacked: true }],
          yAxes: [{ stacked: true }],
        },
      },
    };
    return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(config))}`;
  });

  constructor() {
    effect(() => {
      const user = this.authService.utilisateurSignal();
      if (!user) {
        this.router.navigateByUrl('/connexion');
        return;
      }
      this.contratService
        .chargerContrats(user.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    });

    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.contratService
          .chargerContrat(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe();
        this.contratService
          .chargerGraphiqueConsommation(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe();
      }
    });
  }
}
