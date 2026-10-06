import { TestBed } from '@angular/core/testing';
import { CreationComptePageComponent } from './creation-compte-page.component';
import { AuthService } from '../../service/auth.service';
import { NotificationService } from '../../service/notification.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { provideAnimations } from '@angular/platform-browser/animations';
import { describe, it, expect, vi } from 'vitest';

describe('CreationComptePageComponent', () => {
  function setup() {
    const authService = {
      inscription: vi.fn().mockReturnValue(
        of({
          user: {
            id: 'u2',
            email: 'ayoub@toto.fr',
            firstName: 'Ayoub',
            lastName: 'Oubihi',
            birthDate: '2000-08-15',
          },
        }),
      ),
      verifierEmail: vi.fn().mockReturnValue(of({ exists: false })),
      deconnexion: vi.fn(),
    } as unknown as AuthService;

    const notificationService = {
      definirSucces: vi.fn(),
    } as unknown as NotificationService;

    const router = {
      navigateByUrl: vi.fn(),
    } as unknown as Router;

    const snackBar = {
      open: vi.fn(),
    } as unknown as MatSnackBar;

    TestBed.configureTestingModule({
      imports: [CreationComptePageComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: NotificationService, useValue: notificationService },
        { provide: Router, useValue: router },
        provideAnimations(),
      ],
    });
    TestBed.overrideProvider(MatSnackBar, { useValue: snackBar });
    TestBed.compileComponents();

    const fixture = TestBed.createComponent(CreationComptePageComponent);
    fixture.detectChanges();
    return { fixture, authService, notificationService, router, snackBar };
  }

  it('active le bouton "Creer mon compte" quand les formulaires sont valides', () => {
    // Given
    const { fixture } = setup();
    const component = fixture.componentInstance;

    component.formulaireInfos.setValue({
      nom: 'Oubihi',
      prenom: 'Ayoub',
      naissance: new Date(2000, 7, 15),
    });
    component.formulaireCompte.setValue({
      email: 'ayoub@toto.fr',
      password: 'secret1',
    });

    // When
    fixture.detectChanges();

    // Then
    expect(component.boutonCreationDesactive()).toBe(false);
  });

  it('cree le compte au clic sur "Creer mon compte"', () => {
    // Given
    const { fixture, authService, notificationService, router } = setup();
    const component = fixture.componentInstance;

    component.formulaireInfos.setValue({
      nom: 'Oubihi',
      prenom: 'Ayoub',
      naissance: new Date(2000, 7, 15),
    });
    component.formulaireCompte.setValue({
      email: 'ayoub@toto.fr',
      password: 'secret1',
    });

    // When
    component.creerCompte();

    // Then
    expect((authService.inscription as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalled();
    expect((notificationService.definirSucces as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(
      'Votre compte a ete cree',
    );
    expect((router.navigateByUrl as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(
      '/connexion',
    );
  });

  it("affiche une erreur si l'email existe deja", () => {
    // Given
    const { fixture, authService, snackBar } = setup();
    const component = fixture.componentInstance;

    component.formulaireCompte.setValue({
      email: 'user01@toto.fr',
      password: 'toto-du-57',
    });
    (authService.verifierEmail as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      of({ exists: true }),
    );

    // When
    component.verifierEmailEtContinuer();
    fixture.detectChanges();

    // Then
    expect((snackBar.open as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(
      "L'adresse email est deja utilisee",
      'Fermer',
      expect.objectContaining({
        panelClass: ['snackbar-erreur'],
        horizontalPosition: 'right',
        verticalPosition: 'top',
      }),
    );
  });

  it("affiche une erreur si l'inscription retourne 409", () => {
    // Given
    const { fixture, authService, snackBar } = setup();
    const component = fixture.componentInstance;

    component.formulaireInfos.setValue({
      nom: 'Oubihi',
      prenom: 'Ayoub',
      naissance: new Date(2000, 7, 15),
    });
    component.formulaireCompte.setValue({
      email: 'user01@toto.fr',
      password: 'toto-du-57',
    });
    (authService.inscription as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      throwError(() => ({ status: 409 })),
    );

    // When
    component.creerCompte();
    fixture.detectChanges();

    // Then
    expect((snackBar.open as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(
      "L'adresse email est deja utilisee",
      'Fermer',
      expect.objectContaining({
        panelClass: ['snackbar-erreur'],
        horizontalPosition: 'right',
        verticalPosition: 'top',
      }),
    );
  });
});
