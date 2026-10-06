import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect } from 'vitest';

describe('AuthService', () => {
  it('mocks POST /auth/login', () => {
    // Given
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    const service = TestBed.inject(AuthService);
    const httpMock = TestBed.inject(HttpTestingController);

    // When
    let received: any;
    service.connexion({ email: 'user01@toto.fr', password: 'toto-du-57' }).subscribe((data) => {
      received = data;
    });

    const req = httpMock.expectOne('http://localhost:3000/auth/login');
    req.flush({
      user: {
        id: 'u1',
        email: 'user01@toto.fr',
        firstName: 'Lewis',
        lastName: 'Hamilton',
        birthDate: '1990-01-26',
      },
    });

    // Then
    expect(req.request.method).toBe('POST');
    expect(received.user.email).toBe('user01@toto.fr');
    expect(service.utilisateurSignal()?.email).toBe('user01@toto.fr');
    httpMock.verify();
  });

  it('mocks POST /auth/register', () => {
    // Given
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    const service = TestBed.inject(AuthService);
    const httpMock = TestBed.inject(HttpTestingController);

    // When
    let received: any;
    service
      .inscription({
        email: 'user02@toto.fr',
        password: 'toto-du-54',
        firstName: 'Sarah',
        lastName: 'Dupont',
        birthDate: '1995-05-12',
      })
      .subscribe((data) => {
        received = data;
      });

    const req = httpMock.expectOne('http://localhost:3000/auth/register');
    req.flush({
      user: {
        id: 'u2',
        email: 'user02@toto.fr',
        firstName: 'Sarah',
        lastName: 'Dupont',
        birthDate: '1995-05-12',
      },
    });

    // Then
    expect(req.request.method).toBe('POST');
    expect(received.user.email).toBe('user02@toto.fr');
    expect(service.utilisateurSignal()?.email).toBe('user02@toto.fr');
    httpMock.verify();
  });

  it('mocks GET /auth/check-email', () => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    const service = TestBed.inject(AuthService);
    const httpMock = TestBed.inject(HttpTestingController);

    let received: any;
    service.verifierEmail('user01@toto.fr').subscribe((data) => {
      received = data;
    });

    const req = httpMock.expectOne((request) => {
      return (
        request.url === 'http://localhost:3000/auth/check-email'
        && request.params.get('email') === 'user01@toto.fr'
      );
    });
    req.flush({ exists: true });

    expect(req.request.method).toBe('GET');
    expect(received.exists).toBe(true);
    httpMock.verify();
  });
});
