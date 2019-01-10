import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';

import { RegistrationService } from '../../services/registration.service';
import { IRegistration } from '../../services/api.service';
import { SubscriptionContainer } from '../../utils/subscriptionContainer';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit, OnDestroy {
  private readonly subscriptionContainer: SubscriptionContainer;
  private registrations: IRegistration[];
  public description: string;
  public activeRegistrationId: string;

  constructor(private readonly registrationService: RegistrationService) {
    this.subscriptionContainer = new SubscriptionContainer();
    this.registrations = [];
  }

  async ngOnInit() {
    this.subscriptionContainer.addSubscription(
      this.registrationService.onActiveRegistrationChanged.subscribe((activeRegistration) => this.updateActiveRegistration(activeRegistration)),
      this.registrationService.onDescriptionChanged.subscribe((description) => this.description = description),
      this.registrationService.onRegistrationsChanged.subscribe(async () => this.registrations = await this.registrationService.getRegistrations())
    );
    this.description = this.registrationService.getDescription();
    this.updateActiveRegistration(await this.registrationService.getActiveRegistration());
  }

  ngOnDestroy() {
    this.subscriptionContainer.unSubscribeAll();
  }

  private updateActiveRegistration(activeRegistration: IRegistration) {
    this.activeRegistrationId = activeRegistration ? activeRegistration.id : undefined;
  }

  async showActivePlayer() {
    // Show registrations if other players have been registered
    const otherRegistration = this.registrations.find((r) => r.id !== this.activeRegistrationId);
    if (otherRegistration) {
      return true;
    }

    return false;
  }

  async onChangeActiveRegistration(event: Event) {
    const target = event.target as HTMLSelectElement;
    const activeRegistration = this.registrations.find((r) => r.id === target.value);
    if (activeRegistration) {
      await this.registrationService.setActiveRegistration(activeRegistration);
    }
  }

  async onSetDescription(event: Event) {
    const newDescription = (event.target as HTMLInputElement).value;
    if (this.description !== newDescription) {
      await this.registrationService.setDescription(newDescription)
      this.description = newDescription;
    }
  }
}
