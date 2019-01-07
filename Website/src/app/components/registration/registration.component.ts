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
  public description: string;
  public activeRegistrationId: string;

  constructor(private readonly registrationService: RegistrationService) {
    this.subscriptionContainer = new SubscriptionContainer();
  }

  ngOnInit() {
    this.description = this.registrationService.getDescription();
    this.updateActiveRegistration(this.registrationService.getActiveRegistration());
    this.subscriptionContainer.addSubscription(
      this.registrationService.onActiveRegistrationChanged.subscribe((activeRegistration) => this.updateActiveRegistration(activeRegistration)),
      this.registrationService.onDescriptionChanged.subscribe((description) => this.description = description)
    );
  }

  ngOnDestroy() {
    this.subscriptionContainer.unSubscribeAll();
  }

  private updateActiveRegistration(activeRegistration: IRegistration) {
    this.activeRegistrationId = activeRegistration ? activeRegistration.id : undefined;
  }

  getRegistrations = () => this.registrationService.getRegistrations();

  showActivePlayer() {
    // Show registrations if other players have been registered
    const otherRegistration = this.getRegistrations().find((r) => r.id !== this.activeRegistrationId);
    if (otherRegistration) {
      return true;
    }

    return false;
  }

  onChangeActiveRegistration(event: Event) {
    const target = event.target as HTMLSelectElement;
    const activeRegistration = this.getRegistrations().find((r) => r.id === target.value);
    if (activeRegistration) {
      this.registrationService.setActiveRegistration(activeRegistration).subscribe();
    }
  }

  onSetDescription(event: Event) {
    const newDescription = (event.target as HTMLInputElement).value;
    if (this.description !== newDescription) {
      this.registrationService.setDescription(newDescription).subscribe(() => {
        this.description = newDescription;
      });
    }
  }
}
