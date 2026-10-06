import { TestBed } from '@angular/core/testing';
import { ContratService } from './contrat.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect } from 'vitest';

describe('ContratService', () => {
  it('mocks GET /users/:userId/contracts', () => {
    TestBed.configureTestingModule({
      providers: [ContratService, provideHttpClient(), provideHttpClientTesting()],
    });
    const service = TestBed.inject(ContratService);
    const httpMock = TestBed.inject(HttpTestingController);

    service.chargerContrats('u1').subscribe();
    const req = httpMock.expectOne('http://localhost:3000/users/u1/contracts');
    req.flush({
      contracts: [
        {
          id: 'c1',
          userId: 'u1',
          reference: '123',
          name: 'Contrat 1',
          activity: 'Elec',
          subscriptionDate: '2029-01-26',
          address: '3 chemin du moulin, METZ',
          consumptions: [],
          invoices: [],
          nextInvoiceEstimate: 50,
        },
      ],
    });

    expect(req.request.method).toBe('GET');
    expect(service.contratsSignal().length).toBe(1);
    expect(service.contratActifSignal()?.id).toBe('c1');
    httpMock.verify();
  });

  it('mocks GET /contracts/:id/consommations', () => {
    TestBed.configureTestingModule({
      providers: [ContratService, provideHttpClient(), provideHttpClientTesting()],
    });
    const service = TestBed.inject(ContratService);
    const httpMock = TestBed.inject(HttpTestingController);

    service.chargerGraphiqueConsommation('c1').subscribe();
    const req = httpMock.expectOne('http://localhost:3000/contracts/c1/consommations');
    req.flush({
      data: {
        labels: ['Jan', 'Fev'],
        series: [
          { label: 'Heures pleines', data: [120, 90] },
          { label: 'Heures creuses', data: [80, 60] },
        ],
      },
    });

    expect(req.request.method).toBe('GET');
    expect(service.graphiqueConsommationSignal().labels.length).toBe(2);
    httpMock.verify();
  });
});
