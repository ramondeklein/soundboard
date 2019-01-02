import { Injectable, OnDestroy } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService implements  OnDestroy {
  private readonly id: string = Math.random().toString(36).substr(2, 16);
  private description?: string;
  private registrationTimer: any;

  constructor(private readonly api: ApiService) {
    this.description = localStorage.getItem('description');
    if (this.description) {
      this.register();
    }
  }

  public ngOnDestroy() {
    if (this.description) {
      this.description = undefined;
      this.register();
    }
  }

  public setDescription(description?: string) {
    this.description = description;
    if (this.description) {
      localStorage.setItem('description', description);
    } else {
      localStorage.removeItem('description');
    }

    this.register();
  }

  public getDescription() {
    return this.description;
  }

  private register() {
    if (this.registrationTimer) {
      clearTimeout(this.registrationTimer);
    }

    if (this.description) {
      this.api.playerRegister({
        id: this.id,
        description: this.description
      }).subscribe(() => {
        this.registrationTimer = setTimeout(() => this.register(), 60000);
      });
    } else {
      this.api.playerUnregister(this.id).subscribe();
    }
  }
}
