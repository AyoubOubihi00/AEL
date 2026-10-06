import { TestBed } from '@angular/core/testing';
import { ConnexionPageComponent } from './connexion-page.component';
import { AuthService } from '../../service/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { provideAnimations } from '@angular/platform-browser/animations';
import { describe, it, expect, vi } from 'vitest';

describe('ConnexionPageComponent', () => {
  function setup() {
    const authService = {
      connexion: vi.fn().mockReturnValue(
        of({
          user: {
            id: 'u1',
            email: 'user01@toto.fr',
            firstName: 'Lewis',
            lastName: 'Hamilton',
            birthDate: '1990-01-26',
          },
        }),
      ),
    } as unknown as AuthService;

    const router = {
      navigateByUrl: vi.fn(),
    } as unknown as Router;

    const snackBar = {
      open: vi.fn(),
    } as unknown as MatSnackBar;

    TestBed.configureTestingModule({
      imports: [ConnexionPageComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        provideAnimations(),
      ],
    });
    TestBed.overrideProvider(MatSnackBar, { useValue: snackBar });
    TestBed.compileComponents();

    const fixture = TestBed.createComponent(ConnexionPageComponent);
    fixture.detectChanges();
    return { fixture, authService, router, snackBar };
  }

  it('desactive le bouton si le formulaire est invalide', () => {
    // Given
    const { fixture } = setup();

    // When
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    const boutonConnexion = buttons.find((btn) => btn.textContent?.includes('Se connecter'));

    // Then
    expect(boutonConnexion?.disabled).toBe(true);
  });

  it('appelle la connexion quand le formulaire est valide', () => {
    // Given
    const { fixture, authService, router } = setup();
    const component = fixture.componentInstance;

    component.formulaire.setValue({ email: 'user01@toto.fr', password: 'toto-du-57' });
    fixture.detectChanges();

    // When
    component.seConnecter();

    // Then
    expect((authService.connexion as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith({
      email: 'user01@toto.fr',
      password: 'toto-du-57',
    });
    expect((router.navigateByUrl as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(
      '/tableau-bord',
    );
  });

  it("affiche une erreur quand l'authentification echoue", () => {
    // Given
    const { fixture, authService, snackBar } = setup();
    const component = fixture.componentInstance;

    component.formulaire.setValue({ email: 'user01@toto.fr', password: 'mauvais-mdp' });
    (authService.connexion as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      throwError(() => ({ status: 401 })),
    );

    // When
    component.seConnecter();
    fixture.detectChanges();

    // Then
    expect((snackBar.open as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(
      "Erreur d'authentification",
      'Fermer',
      expect.objectContaining({
        panelClass: ['snackbar-erreur'],
        horizontalPosition: 'right',
        verticalPosition: 'top',
      }),
    );
  });
});
