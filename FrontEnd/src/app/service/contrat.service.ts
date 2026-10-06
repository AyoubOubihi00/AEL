import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Contrat } from '../core/modeles/contrat';
import { GraphiqueConsommation } from '../core/modeles/graphique-consommation';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ContratService {
  private http = inject(HttpClient);
  private contrats = signal<Contrat[]>([]);
  private contratActif = signal<Contrat | null>(null);
  private graphiqueConsommation = signal<GraphiqueConsommation>({ labels: [], series: [] });

  readonly contratsSignal = this.contrats.asReadonly();
  readonly contratActifSignal = this.contratActif.asReadonly();
  readonly graphiqueConsommationSignal = this.graphiqueConsommation.asReadonly();

  chargerContrats(userId: string) {
    return this.http
      .get<{ contracts: Contrat[] }>(`http://localhost:3000/users/${userId}/contracts`)
      .pipe(
        tap((response) => {
          this.contrats.set(response.contracts);
          if (response.contracts.length && !this.contratActif()) {
            this.contratActif.set(response.contracts[0]);
          }
        }),
      );
  }

  chargerContrat(contratId: string) {
    return this.http
      .get<{ contract: Contrat }>(`http://localhost:3000/contracts/${contratId}`)
      .pipe(tap((response) => this.contratActif.set(response.contract)));
  }

  chargerGraphiqueConsommation(contratId: string) {
    return this.http
      .get<{ data: GraphiqueConsommation }>(`http://localhost:3000/contracts/${contratId}/consommations`)
      .pipe(tap((response) => this.graphiqueConsommation.set(response.data)));
  }

  definirContratActif(contrat: Contrat) {
    this.contratActif.set(contrat);
  }
}
