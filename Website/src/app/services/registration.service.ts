import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable, pipe } from 'rxjs';

import { ApiService, IRegistration } from './api.service';
import { SubscriptionContainer } from '../utils/subscriptionContainer';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService implements OnDestroy {
  public readonly onActiveRegistrationChanged = new Subject<Readonly<IRegistration>>();
  public readonly onDescriptionChanged = new Subject<string>();
  public readonly onRegistrationsChanged = new Subject();

  private readonly id: string;
  private readonly subscriptionContainer: SubscriptionContainer;
  private readonly initialized: Promise<any>;
  private registrations: Readonly<IRegistration>[];
  private activeRegistration?: Readonly<IRegistration>;
  private description?: string;
  private registrationTimer: any;

  constructor(private readonly api: ApiService) {
    this.id = localStorage.getItem('id');
    if (!this.id) {
      this.id = Math.random().toString(36).substr(2, 16);
      localStorage.setItem('id', this.id);
    }
    this.description = localStorage.getItem('description');

    this.registrations = [{
      id: this.id,
      description: this.description
    }];

    this.subscriptionContainer = new SubscriptionContainer(
      this.api.onRegistrationRegistered.subscribe((registration) => this.onRegister(registration)),
      this.api.onRegistrationUnregistered.subscribe((registration) => this.onUnregister(registration)),
      this.api.onRegistrationActiveChanged.subscribe((registration) => this.onSetActive(registration)),
    );

    this.initialized = (async () => {
      this.registrations = await this.api.registrationGetAll();
      this.registrations.map((r) => this.onRegister(r));
      this.onSetActive(await this.api.registrationGetActive());

      if (this.description) {
        await this.register();
      }
    })();
  }

  async ngOnDestroy() {
    this.subscriptionContainer.unSubscribeAll();
    if (this.description) {
      this.description = undefined;
      await this.register();
    }
  }

  public async setDescription(description?: string) {
    this.description = description;
    if (this.description) {
      localStorage.setItem('description', description);
    } else {
      localStorage.removeItem('description');
    }

    await this.initialized;
    await this.register();
  }

  public getRegistrationId = () => this.id;
  public getDescription = () => this.description;

  public async getRegistrations() {
    await this.initialized;
    return this.registrations;
  }

  public async getActiveRegistration() {
    await this.initialized;
    return this.activeRegistration;
  }

  public async setActiveRegistration(activeRegistration?: Readonly<IRegistration>) {
    await this.api.registrationSetActive(activeRegistration != null ? activeRegistration.id : undefined);
  }

  private async register() {
    if (this.registrationTimer) {
      clearTimeout(this.registrationTimer);
    }

    if (this.description) {
      await this.api.registrationRegister({
        id: this.id,
        description: this.description
      });
      this.registrationTimer = setTimeout(() => this.register(), 60000);
    } else {
      await this.api.registrationUnregister(this.id);
    }
  }

  private onRegister(registration: Readonly<IRegistration>) {
    const index = this.registrations.findIndex((r) => r.id === registration.id);
    if (index >= 0) {
      this.registrations[index] = registration;
    } else {
      this.registrations.push(registration);
    }
    this.onRegistrationsChanged.next();
    if (registration.id === this.id) {
      this.description = registration.description;
      this.onDescriptionChanged.next(this.description);
    }
  }

  private onUnregister(registration: Readonly<IRegistration>) {
    const index = this.registrations.findIndex((r) => r.id === registration.id);
    if (index >= 0) {
      this.registrations.splice(index);
      this.onRegistrationsChanged.next();
    }
  }

  private onSetActive(registration: Readonly<IRegistration>) {
    const currentActiveId = this.activeRegistration ? this.activeRegistration.id : undefined;
    const newActiveId = registration ? registration.id : undefined;
    if (currentActiveId === newActiveId) {
      return;
    }

    if (!registration) {
      this.activeRegistration = undefined;
    } else {
      const index = this.registrations.findIndex((r) => r.id === registration.id);
      this.activeRegistration = index >= 0 ? this.registrations[index] : undefined;
    }

    this.onActiveRegistrationChanged.next(this.activeRegistration);
  }
}
