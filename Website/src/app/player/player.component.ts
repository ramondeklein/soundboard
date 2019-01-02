import { ChangeDetectorRef, Component } from '@angular/core';
import { PlayerService } from '../player.service';
import { RegistrationService } from '../registration.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent {
  public description: string;

  constructor(
    private readonly playerService: PlayerService,
    private readonly registrationService: RegistrationService,
    private readonly cd: ChangeDetectorRef
  ) {
    this.description = this.registrationService.getDescription();
  }

  onFormSubmit() {
    this.registrationService.setDescription(this.description);
  }

  getActivePlayer = () => this.playerService.getIsActivePlayer();
  toggleActivePlayer = () => this.playerService.setIsActivePlayer(!this.playerService.getIsActivePlayer());
}
