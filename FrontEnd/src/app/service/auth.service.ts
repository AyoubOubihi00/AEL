import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Utilisateur } from '../core/modeles/utilisateur';

type ConnexionPayload = {
  email: string;
  password: string;
};

type InscriptionPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate: string;
};
type VerificationEmailResponse = {
  exists: boolean;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private utilisateur = signal<Utilisateur | null>(null);

  readonly utilisateurSignal = this.utilisateur.asReadonly();

  connexion(payload: ConnexionPayload) {
    return this.http
      .post<{ user: Utilisateur }>('http://localhost:3000/auth/login', payload)
      .pipe(tap((response) => this.utilisateur.set(response.user)));
  }

  inscription(payload: InscriptionPayload) {
    return this.http
      .post<{ user: Utilisateur }>('http://localhost:3000/auth/register', payload)
      .pipe(tap((response) => this.utilisateur.set(response.user)));
  }

  verifierEmail(email: string) {
    return this.http.get<VerificationEmailResponse>('http://localhost:3000/auth/check-email', {
      params: { email },
    });
  }

  deconnexion() {
    this.utilisateur.set(null);
  }
}
