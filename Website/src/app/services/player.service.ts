import { Injectable, OnDestroy } from '@angular/core';
import { Howl } from 'howler';
import { Subject } from 'rxjs';

import { Sample } from '../model/sample';
import { SamplePlayInfo } from '../model/samplePlayInfo';
import { ApiService, IQueuedSample, IRegistration } from './api.service';
import { CatalogService } from './catalog.service';
import { RegistrationService } from './registration.service';
import { SubscriptionContainer } from '../utils/subscriptionContainer';

@Injectable({
  providedIn: 'root'
})
export class PlayerService implements OnDestroy {
  public readonly onSampleStarted = new Subject<Readonly<SamplePlayInfo>>();
  public readonly onSampleFinished = new Subject<Readonly<SamplePlayInfo>>();

  private readonly subscriptionContainer: SubscriptionContainer;
  private isActivePlayer: boolean;
  private isPlaying: boolean;

  constructor(
    private readonly api: ApiService,
    private readonly catalog: CatalogService,
    private readonly registration: RegistrationService
  ) {
    this.subscriptionContainer = new SubscriptionContainer(
      this.registration.onActiveRegistrationChanged.subscribe((r) => this.onActiveRegistrationChanged(r)),
      this.api.onPlayListSampleEnqueued.subscribe(() => this.playNextSample()),
      this.api.onPlayingStarted.subscribe(async (queuedSample) => this.onSampleStarted.next(await this.getSamplePlayInfo(queuedSample))),
      this.api.onPlayingFinished.subscribe(async (queuedSample) => this.onSampleFinished.next(await this.getSamplePlayInfo(queuedSample)))
    );

    this.registration.getActiveRegistration().then((activeRegistration) => this.onActiveRegistrationChanged(activeRegistration));
  }

  ngOnDestroy() {
    this.subscriptionContainer.unSubscribeAll();
  }

  public getIsPlaying = () => this.isPlaying;

  private async getSamplePlayInfo(queuedSample: Readonly<IQueuedSample>) {
    const sample = await this.catalog.getSampleByQueuedSample(queuedSample);
    const playInfo = new SamplePlayInfo(sample);
    return playInfo;
  }

  private playSample(queuedSample: IQueuedSample) {
    const sound = new Howl({
      src: [this.api.sampleGetStreamUrl(queuedSample.sampleId)],
      format: 'mp3',
      onload: async () => await this.api.playingStarted(queuedSample),
      onloaderror: (_, err) => {
        console.error(`Cannot load sample '${queuedSample.sampleId}': ${err.message}`);
        this.isPlaying = false;
        this.playNextSample();
      },
      onplayerror: (_, err) => {
        console.error(`Cannot play sample '${queuedSample.sampleId}': ${err.message}`);
        this.isPlaying = false;
        this.playNextSample();
      },
      onend: async () => {
        this.isPlaying = false;
        await this.api.playingFinished(queuedSample);
        this.playNextSample();
      }
    });
    sound.play();
  }

  private async playNextSample() {
    if (this.isActivePlayer && !this.isPlaying) {
      this.isPlaying = true;
      try
      {
        const queuedSample = await this.api.playListPopSample();
        if (queuedSample) {
          const sample = this.catalog.getSampleByQueuedSample(queuedSample);
          if (!sample) {
            console.error(`Cannot find sample '${queuedSample.category}${queuedSample.title}'.`);
            this.isPlaying = false;
            return;
          }
          this.playSample(queuedSample);
        } else {
          this.isPlaying = false;
        }
      } catch (err) {
        console.error(`Cannot determine next sample (pop failed): ${err.message}`);
        this.isPlaying = false;
      }
    }
  }

  private onActiveRegistrationChanged(registration: IRegistration) {
    const isActivePlayer = !!registration && this.registration.getRegistrationId() === registration.id;
    if (this.isActivePlayer !== isActivePlayer) {
      this.isActivePlayer = isActivePlayer;
      if (this.isActivePlayer) {
        this.playNextSample();
      }
    }
  }
}
