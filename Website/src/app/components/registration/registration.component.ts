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
  public activeRegistrationId: string;
  public description: string;

  constructor(private readonly registrationService: RegistrationService) {
    this.subscriptionContainer = new SubscriptionContainer();
  }

  ngOnInit() {
    this.description = this.registrationService.getDescription();
    this.updateActiveRegistration(this.registrationService.getActiveRegistration());
    this.subscriptionContainer.addSubscription(
      this.registrationService.onActiveRegistrationChanged.subscribe((activeRegistration) => this.updateActiveRegistration(activeRegistration))
    );
  }

  ngOnDestroy() {
    this.subscriptionContainer.unSubscribeAll();
  }

  private updateActiveRegistration(activeRegistration: IRegistration) {
    this.activeRegistrationId = activeRegistration ? activeRegistration.id : undefined;
  }

  onFormSubmit() {
    const activeRegistration = this.getRegistrations().find((r) => r.id === this.activeRegistrationId);
    this.registrationService.setActiveRegistration(activeRegistration);
    this.registrationService.setDescription(this.description);
  }

  getRegistrations = () => this.registrationService.getRegistrations();
  getActiveRegistration = () => this.registrationService.getActiveRegistration();
}
