import { TestBed } from '@angular/core/testing';
import { TableauBordPageComponent } from './tableau-bord-page.component';
import { AuthService } from '../../service/auth.service';
import { ContratService } from '../../service/contrat.service';
import { TableauBordService } from '../../service/tableau-bord.service';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { describe, it, expect, vi } from 'vitest';

describe('TableauBordPageComponent', () => {
  it('appelle les WS dashboard pour un utilisateur connecte', async () => {
    const authService = {
      utilisateurSignal: signal({
        id: 'u1',
        email: 'user01@toto.fr',
        firstName: 'Lewis',
        lastName: 'Hamilton',
        birthDate: '1990-01-26',
      }),
    } as unknown as AuthService;

    const contratService = {
      contratsSignal: signal([]),
      chargerContrats: vi.fn().mockReturnValue(of(null)),
    } as unknown as ContratService;

    const tableauBordService = {
      consommationsSignal: signal({ labels: [], series: [] }),
      factureSignal: signal(null),
      estimationSignal: signal(0),
      justificatifSignal: signal(false),
      historiqueFacturesSignal: signal([]),
      chargerConsommations: vi.fn().mockReturnValue(of(null)),
      chargerFactures: vi.fn().mockReturnValue(of(null)),
      chargerEstimation: vi.fn().mockReturnValue(of(null)),
      chargerJustificatif: vi.fn().mockReturnValue(of(null)),
      chargerHistoriqueFactures: vi.fn().mockReturnValue(of(null)),
    } as unknown as TableauBordService;

    await TestBed.configureTestingModule({
      imports: [TableauBordPageComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ContratService, useValue: contratService },
        { provide: TableauBordService, useValue: tableauBordService },
        provideRouter([]),
        provideAnimations(),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TableauBordPageComponent);
    fixture.detectChanges();

    expect(contratService.chargerContrats).toHaveBeenCalledWith('u1');
    expect(tableauBordService.chargerConsommations).toHaveBeenCalledWith('u1');
    expect(tableauBordService.chargerFactures).toHaveBeenCalledWith('u1');
    expect(tableauBordService.chargerEstimation).toHaveBeenCalledWith('u1');
    expect(tableauBordService.chargerJustificatif).toHaveBeenCalledWith('u1');
    expect(tableauBordService.chargerHistoriqueFactures).toHaveBeenCalledWith('u1');
  });
});
