import { Component, OnInit, OnDestroy } from '@angular/core';

import { SamplePlayInfo } from '../../model/samplePlayInfo';
import { PlayerService } from '../../services/player.service';
import { SubscriptionContainer } from '../../utils/subscriptionContainer';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, OnDestroy {
  private readonly subscriptionContainer: SubscriptionContainer;
  private activeSamplePlayInfo: Readonly<SamplePlayInfo>;

  constructor(private readonly player: PlayerService) {
    this.subscriptionContainer = new SubscriptionContainer();
  }

  ngOnInit() {
    this.subscriptionContainer.addSubscription(
      this.player.onSampleStarted.subscribe((samplePlayInfo) => this.activeSamplePlayInfo = samplePlayInfo),
      this.player.onSampleFinished.subscribe(() => this.activeSamplePlayInfo = undefined)
    );
  }

  ngOnDestroy() {
    this.subscriptionContainer.unSubscribeAll();
  }

  public isPlaying() {
    return this.activeSamplePlayInfo;
  }

  public getCategoryTitle() {
    if (this.activeSamplePlayInfo) {
      const sample = this.activeSamplePlayInfo.getSample();
      let title = sample.getCategory().getTitle();
      if (title.startsWith('/')) {
        title = title.substring(1);
      }
      if (title.endsWith('/')) {
        title = title.substring(0, title.length - 1);
      }
      return title;
    }
  }

  public getSampleTitle() {
    if (this.activeSamplePlayInfo) {
      const sample = this.activeSamplePlayInfo.getSample();
      return sample.getTitle();
    }
  }
}
