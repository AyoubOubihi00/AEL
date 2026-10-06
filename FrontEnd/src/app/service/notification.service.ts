import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private messageSucces = signal<string | null>(null);

  readonly messageSuccesSignal = this.messageSucces.asReadonly();

  definirSucces(message: string) {
    this.messageSucces.set(message);
  }

  consommerSucces() {
    const message = this.messageSucces();
    this.messageSucces.set(null);
    return message;
  }
}
