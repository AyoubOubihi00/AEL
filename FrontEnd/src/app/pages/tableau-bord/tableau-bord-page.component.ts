import { Component, computed, effect, inject, DestroyRef, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service';
import { ContratService } from '../../service/contrat.service';
import { TableauBordService } from '../../service/tableau-bord.service';
import { MenuLateralComponent } from '../../features/menu-lateral/menu-lateral.component';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-page-tableau-bord',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatSidenavModule,
    MenuLateralComponent,
  ],
  templateUrl: './tableau-bord-page.component.html',
  styleUrl: './tableau-bord-page.component.css',
})
export class TableauBordPageComponent {
  private authService = inject(AuthService);
  private contratService = inject(ContratService);
  private tableauBordService = inject(TableauBordService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly utilisateur = this.authService.utilisateurSignal;
  readonly contrats = this.contratService.contratsSignal;
  readonly consommations = this.tableauBordService.consommationsSignal;
  readonly facture = this.tableauBordService.factureSignal;
  readonly estimation = this.tableauBordService.estimationSignal;
  readonly justificatif = this.tableauBordService.justificatifSignal;
  readonly historiqueFactures = this.tableauBordService.historiqueFacturesSignal;
  readonly historiqueVisible = signal(false);
  readonly urlGraphique = computed(() => {
    const data = this.consommations();
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
      const user = this.utilisateur();
      if (!user) {
        this.router.navigateByUrl('/connexion');
        return;
      }
      this.contratService
        .chargerContrats(user.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();

      this.tableauBordService
        .chargerConsommations(user.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();

      this.tableauBordService
        .chargerFactures(user.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();

      this.tableauBordService
        .chargerEstimation(user.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();

      this.tableauBordService
        .chargerJustificatif(user.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();

      this.tableauBordService
        .chargerHistoriqueFactures(user.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    });
  }

  toggleHistorique() {
    this.historiqueVisible.set(!this.historiqueVisible());
  }

  telechargerJustificatif() {
    if (!this.justificatif()) {
      return;
    }
    const user = this.utilisateur();
    const now = new Date();
    const date = now.toLocaleDateString('fr-FR');
    const contenu = [
      'Justificatif de domicile',
      '',
      `Nom: ${user?.lastName ?? 'Client'}`,
      `Prenom: ${user?.firstName ?? ''}`,
      `Email: ${user?.email ?? ''}`,
      '',
      `Date: ${date}`,
      'Adresse: 3 chemin du moulin, 57000 METZ',
      '',
      `Estimation prochaine facture: ${this.estimation()} EUR`,
    ].join('\n');

    const blob = new Blob([contenu], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const lien = document.createElement('a');
    lien.href = url;
    lien.download = 'justificatif-domicile.txt';
    lien.click();
    URL.revokeObjectURL(url);
  }
}
