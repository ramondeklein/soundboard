import { Injectable, OnDestroy } from '@angular/core';
import { Howl } from 'howler';
import { Subscription, Subject, Observable } from 'rxjs';

import Sample from './model/sample';
import SamplePlayInfo from './model/samplePlayInfo';

import { ApiService, IQueuedSample } from './api.service';
import { CatalogService } from './catalog.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerService implements OnDestroy {
  public readonly samplePlayed = new Subject<Readonly<SamplePlayInfo>>();
  private readonly subscriptions = [];
  private isActivePlayer: boolean;
  private isPlaying: boolean;

  private saveRegistrations(subscriptions: Subscription[]) {
    this.subscriptions.push(...subscriptions);
  }

  constructor(private readonly api: ApiService, private readonly catalog: CatalogService) {
    this.saveRegistrations([
      this.api.onPlayListSampleEnqueued.subscribe(() => this.playNextSample()),
    ]);
  }

  ngOnDestroy() {
    this.subscriptions.map((r) => r.unsubscribe());
  }

  public getIsActivePlayer = () => this.isActivePlayer;
  public getIsPlaying = () => this.isPlaying;

  public setIsActivePlayer(isActivePlayer: boolean) {
    this.isActivePlayer = isActivePlayer;
    if (this.isActivePlayer && !this.isPlaying) {
      this.playNextSample();
    }
  }

  private playSample(sample: Sample) {
    const sound = new Howl({
      src: [this.api.sampleGetStreamUrl(sample.getId())],
      format: 'mp3',
      onloaderror: (soundId, err) => {
        console.error(`Cannot load sample '${sample.getCategory().getTitle()}${sample.getTitle()}': ${err.message}`);
        this.isPlaying = false;
        this.playNextSample();
      },
      onplayerror: (soundId, err) => {
        console.error(`Cannot play sample '${sample.getCategory().getTitle()}${sample.getTitle()}': ${err.message}`);
        this.isPlaying = false;
        this.playNextSample();
      },
      onend: () => {
        this.isPlaying = false;
        this.samplePlayed.next(new SamplePlayInfo(sample));
        this.api.sampleMarkPlayed(sample.getId()).subscribe(() => this.playNextSample());
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
              this.playSample(sample);
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
}
