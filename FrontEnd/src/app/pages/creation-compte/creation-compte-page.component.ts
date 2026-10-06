import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { NotificationService } from '../../service/notification.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-page-creation-compte',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatStepperModule,
  ],
  templateUrl: './creation-compte-page.component.html',
  styleUrl: './creation-compte-page.component.css',
})
export class CreationComptePageComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  @ViewChild(MatStepper) stepper?: MatStepper;

  readonly chargement = signal(false);
  readonly verificationEnCours = signal(false);
  readonly dateMax = signal(new Date());
  readonly formulaireInfos = this.fb.group({
    nom: ['', [Validators.required]],
    prenom: ['', [Validators.required]],
    naissance: [null as Date | null, [Validators.required, ageMinimumValidator(18)]],
  });

  readonly formulaireCompte = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  private statutInfos = toSignal(this.formulaireInfos.statusChanges, {
    initialValue: this.formulaireInfos.status,
  });
  private statutCompte = toSignal(this.formulaireCompte.statusChanges, {
    initialValue: this.formulaireCompte.status,
  });

  readonly resume = signal({
    nom: '',
    prenom: '',
    naissance: null as Date | null,
    email: '',
  });

  readonly boutonCreationDesactive = computed(() => {
    return (
      this.statutInfos() !== 'VALID'
      || this.statutCompte() !== 'VALID'
      || this.chargement()
    );
  });

  revenirConnexion() {
    this.router.navigateByUrl('/connexion');
  }

  creerCompte() {
    if (this.formulaireInfos.invalid || this.formulaireCompte.invalid) {
      this.formulaireInfos.markAllAsTouched();
      this.formulaireCompte.markAllAsTouched();
      return;
    }

    const naissance = this.formulaireInfos.value.naissance as Date | null;
    if (!naissance) {
      return;
    }

    this.chargement.set(true);
    const payload = {
      email: this.formulaireCompte.value.email ?? '',
      password: this.formulaireCompte.value.password ?? '',
      firstName: this.formulaireInfos.value.prenom ?? '',
      lastName: this.formulaireInfos.value.nom ?? '',
      birthDate: this.formatDate(naissance),
    };

    this.authService.inscription(payload).subscribe({
      next: () => {
        this.chargement.set(false);
        this.notificationService.definirSucces('Votre compte a ete cree');
        this.authService.deconnexion();
        this.router.navigateByUrl('/connexion');
      },
      error: (error) => {
        this.chargement.set(false);
        if (error?.status === 409) {
          this.snackBar.open("L'adresse email est deja utilisee", 'Fermer', {
            duration: 3500,
            panelClass: ['snackbar-erreur'],
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
          const etape = this.stepper?.selected;
          if (etape) {
            etape.completed = false;
            etape.editable = true;
          }
        } else {
          this.snackBar.open('Une erreur est survenue', 'Fermer', {
            duration: 3000,
            panelClass: ['snackbar-erreur'],
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
        }
      },
    });
  }

  verifierEmailEtContinuer() {
    if (this.formulaireCompte.invalid) {
      this.formulaireCompte.markAllAsTouched();
      return;
    }
    const email = (this.formulaireCompte.value.email ?? '').toString().trim().toLowerCase();
    if (!email) {
      return;
    }

    this.verificationEnCours.set(true);
    this.authService.verifierEmail(email).subscribe({
      next: (response) => {
        this.verificationEnCours.set(false);
        if (response.exists) {
          this.snackBar.open("L'adresse email est deja utilisee", 'Fermer', {
            duration: 3500,
            panelClass: ['snackbar-erreur'],
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
          return;
        }
        this.resume.set({
          nom: this.formulaireInfos.value.nom ?? '',
          prenom: this.formulaireInfos.value.prenom ?? '',
          naissance: this.formulaireInfos.value.naissance ?? null,
          email: this.formulaireCompte.value.email ?? '',
        });
        this.stepper?.next();
      },
      error: () => {
        this.verificationEnCours.set(false);
        this.stepper?.next();
      },
    });
  }

  private formatDate(date: Date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

function ageMinimumValidator(minimum: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as Date | null;
    if (!value) {
      return null;
    }
    const today = new Date();
    const limit = new Date(
      today.getFullYear() - minimum,
      today.getMonth(),
      today.getDate(),
    );
    return value <= limit ? null : { minAge: true };
  };
}
