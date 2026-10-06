import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Facture, FactureHistorique } from '../core/modeles/contrat';
import { GraphiqueConsommation } from '../core/modeles/graphique-consommation';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TableauBordService {
  private http = inject(HttpClient);
  private consommations = signal<GraphiqueConsommation>({ labels: [], series: [] });
  private facture = signal<Facture | null>(null);
  private estimation = signal<number>(0);
  private justificatif = signal<boolean>(false);
  private historiqueFactures = signal<FactureHistorique[]>([]);

  readonly consommationsSignal = this.consommations.asReadonly();
  readonly factureSignal = this.facture.asReadonly();
  readonly estimationSignal = this.estimation.asReadonly();
  readonly justificatifSignal = this.justificatif.asReadonly();
  readonly historiqueFacturesSignal = this.historiqueFactures.asReadonly();

  chargerConsommations(userId: string) {
    return this.http
      .get<{ data: GraphiqueConsommation }>(`http://localhost:3000/dashboard/${userId}/consommations`)
      .pipe(tap((response) => this.consommations.set(response.data)));
  }

  chargerFactures(userId: string) {
    return this.http
      .get<{ data: Facture | null }>(`http://localhost:3000/dashboard/${userId}/factures`)
      .pipe(tap((response) => this.facture.set(response.data)));
  }

  chargerEstimation(userId: string) {
    return this.http
      .get<{ data: number }>(`http://localhost:3000/dashboard/${userId}/estimation`)
      .pipe(tap((response) => this.estimation.set(response.data)));
  }

  chargerJustificatif(userId: string) {
    return this.http
      .get<{ data: boolean }>(`http://localhost:3000/dashboard/${userId}/justificatif`)
      .pipe(tap((response) => this.justificatif.set(response.data)));
  }

  chargerHistoriqueFactures(userId: string) {
    return this.http
      .get<{ data: FactureHistorique[] }>(`http://localhost:3000/dashboard/${userId}/factures/historique`)
      .pipe(tap((response) => this.historiqueFactures.set(response.data)));
  }
}
