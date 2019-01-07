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

  private readonly id: string;
  private readonly subscriptionContainer: SubscriptionContainer;
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

    this.api.registrationGetAll().subscribe((registrations) => {
      this.registrations = registrations;
      this.api.registrationGetActive().subscribe((activeRegistration) => {
        this.onSetActive(activeRegistration);
      });
    });

    this.subscriptionContainer = new SubscriptionContainer(
      this.api.onRegistrationRegistered.subscribe((registration) => this.onRegister(registration)),
      this.api.onRegistrationUnregistered.subscribe((registration) => this.onUnregister(registration)),
      this.api.onRegistrationActiveChanged.subscribe((registration) => this.onSetActive(registration)),
    );

    if (this.description) {
      this.register().subscribe();
    }
  }

  ngOnDestroy() {
    this.subscriptionContainer.unSubscribeAll();
    if (this.description) {
      this.description = undefined;
      this.register().subscribe();
    }
  }

  public setDescription(description?: string) {
    this.description = description;
    if (this.description) {
      localStorage.setItem('description', description);
    } else {
      localStorage.removeItem('description');
    }

    return this.register();
  }

  public getRegistrationId = () => this.id;
  public getDescription = () => this.description;
  public getRegistrations = () => this.registrations;
  public getActiveRegistration = () => this.activeRegistration;

  public setActiveRegistration(activeRegistration?: Readonly<IRegistration>) {
    return this.api.registrationSetActive(activeRegistration != null ? activeRegistration.id : undefined);
  }

  private register(): Observable<void> {
    if (this.registrationTimer) {
      clearTimeout(this.registrationTimer);
    }

    if (this.description) {
      return this.api.registrationRegister({
        id: this.id,
        description: this.description
      }).pipe(map((_) => {
        this.registrationTimer = setTimeout(() => this.register().subscribe(), 60000);
      }));
    } else {
      return this.api.registrationUnregister(this.id).pipe(map((_) => {}));
    }
  }

  private onRegister(registration: Readonly<IRegistration>) {
    const index = this.registrations.findIndex((r) => r.id === registration.id);
    if (index >= 0) {
      this.registrations[index] = registration;
    } else {
      this.registrations.push(registration);
    }
    if (registration.id === this.id) {
      this.description = registration.description;
      this.onDescriptionChanged.next(this.description);
    }
  }

  private onUnregister(registration: Readonly<IRegistration>) {
    const index = this.registrations.findIndex((r) => r.id === registration.id);
    if (index >= 0) {
      this.registrations.splice(index);
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
