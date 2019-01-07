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
      this.api.onPlayingStarted.subscribe((queuedSample) => this.onSampleStarted.next(this.getSamplePlayInfo(queuedSample))),
      this.api.onPlayingFinished.subscribe((queuedSample) => this.onSampleFinished.next(this.getSamplePlayInfo(queuedSample)))
    );

    this.onActiveRegistrationChanged(this.registration.getActiveRegistration());
  }

  ngOnDestroy() {
    this.subscriptionContainer.unSubscribeAll();
  }

  public getIsPlaying = () => this.isPlaying;

  private getSamplePlayInfo(queuedSample: Readonly<IQueuedSample>) {
    const sample = this.catalog.getSampleByQueuedSample(queuedSample);
    const playInfo = new SamplePlayInfo(sample);
    return playInfo;
  }

  private playSample(queuedSample: IQueuedSample) {
    const sound = new Howl({
      src: [this.api.sampleGetStreamUrl(queuedSample.sampleId)],
      format: 'mp3',
      onload: () => this.api.playingStarted(queuedSample).subscribe(),
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
      onend: () => {
        this.isPlaying = false;
        this.api.playingFinished(queuedSample).subscribe(() => this.playNextSample());
      }
    });
    sound.play();
  }

  private playNextSample() {
    if (this.isActivePlayer && !this.isPlaying) {
      this.isPlaying = true;
      this.api.playListPopSample().subscribe(
        (queuedSample: IQueuedSample) => {
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
        },
        err => {
          console.error(`Cannot determine next sample (pop failed): ${err.message}`);
          this.isPlaying = false;
        }
      );
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
