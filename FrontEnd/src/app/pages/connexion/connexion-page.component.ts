import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { NotificationService } from '../../service/notification.service';

@Component({
  selector: 'app-page-connexion',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  templateUrl: './connexion-page.component.html',
  styleUrl: './connexion-page.component.css',
})
export class ConnexionPageComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  readonly chargement = signal(false);
  readonly formulaire = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  private statutFormulaire = toSignal(this.formulaire.statusChanges, {
    initialValue: this.formulaire.status,
  });

  readonly boutonDesactive = computed(
    () => this.statutFormulaire() !== 'VALID' || this.chargement(),
  );

  constructor() {
    const message = this.notificationService.consommerSucces();
    if (message) {
      this.snackBar.open(message, 'Fermer', {
        duration: 3000,
        panelClass: ['snackbar-succes'],
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
    }
  }

  allerInscription() {
    this.router.navigateByUrl('/inscription');
  }

  seConnecter() {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    this.chargement.set(true);
    const { email, password } = this.formulaire.getRawValue();

    this.authService.connexion({ email: email ?? '', password: password ?? '' }).subscribe({
      next: () => {
        this.chargement.set(false);
        this.router.navigateByUrl('/tableau-bord');
      },
      error: () => {
        this.chargement.set(false);
        this.snackBar.open("Erreur d'authentification", 'Fermer', {
          duration: 3000,
          panelClass: ['snackbar-erreur'],
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      },
    });
  }
}
