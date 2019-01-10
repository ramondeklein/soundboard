import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

import { CatalogService } from '../../services/catalog.service';
import { RegistrationService } from '../../services/registration.service';
import { IRegistration } from '../../services/api.service';
import { SubscriptionContainer } from '../../utils/subscriptionContainer';

@Component({
  selector: 'app-toolbox',
  templateUrl: './toolbox.component.html',
  styleUrls: ['./toolbox.component.scss']
})
export class ToolBoxComponent implements OnInit, OnDestroy {
  @Output() filterChanged = new EventEmitter<string>();
  private readonly subscriptionContainer: SubscriptionContainer;
  private registrations: IRegistration[];
  private filter?: string;
  public description: string;
  public activeRegistrationId: string;
  public isSettingsVisible: boolean;

  constructor(private readonly catalogService: CatalogService, private readonly registrationService: RegistrationService) {
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

  public onToggleSettings() {
    this.isSettingsVisible = !this.isSettingsVisible;
  }

  private updateActiveRegistration(activeRegistration: IRegistration) {
    this.activeRegistrationId = activeRegistration ? activeRegistration.id : undefined;
  }

  public onKey(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Escape') {
      input.value = '';
      this.setFilter(undefined);
    } else if (input.value) {
      this.setFilter(input.value);
    } else {
      this.setFilter(undefined);
    }
  }

  public async onScan() {
    await this.catalogService.scan();
  }

  public onRefresh() {
    this.catalogService.refresh();
  }

  private setFilter(filter?: string) {
    if (this.filter !== filter) {
      this.filter = filter;
      this.filterChanged.emit(this.filter);
    }
  }

  public setFocus(key: string) {
    if (key.length === 1) {
      if (this.filter) {
        this.filter += key;
      } else {
        this.filter = key;
      }
    }
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
