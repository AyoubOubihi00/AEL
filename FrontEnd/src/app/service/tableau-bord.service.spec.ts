import { TestBed } from '@angular/core/testing';
import { TableauBordService } from './tableau-bord.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect } from 'vitest';

describe('TableauBordService', () => {
  it('mocks GET /dashboard/:userId/consommations', () => {
    TestBed.configureTestingModule({
      providers: [TableauBordService, provideHttpClient(), provideHttpClientTesting()],
    });
    const service = TestBed.inject(TableauBordService);
    const httpMock = TestBed.inject(HttpTestingController);

    service.chargerConsommations('u1').subscribe();
    const req = httpMock.expectOne('http://localhost:3000/dashboard/u1/consommations');
    req.flush({
      data: {
        labels: ['Jan', 'Fev'],
        series: [
          { label: 'Heures pleines', data: [100, 120] },
          { label: 'Heures creuses', data: [60, 70] },
        ],
      },
    });

    expect(req.request.method).toBe('GET');
    expect(service.consommationsSignal().labels.length).toBe(2);
    httpMock.verify();
  });
});
