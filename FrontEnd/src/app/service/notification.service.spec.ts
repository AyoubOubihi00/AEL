import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { describe, it, expect } from 'vitest';

describe('NotificationService', () => {
  it('consomme et reinitialise le message', () => {
    TestBed.configureTestingModule({
      providers: [NotificationService],
    });
    const service = TestBed.inject(NotificationService);

    service.definirSucces('Votre compte a ete cree');
    const message = service.consommerSucces();

    expect(message).toBe('Votre compte a ete cree');
    expect(service.consommerSucces()).toBe(null);
  });
});
