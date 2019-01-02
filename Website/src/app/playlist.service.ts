import { Injectable, OnDestroy } from '@angular/core';
import { Subscription, Subject } from 'rxjs';

import Sample from './model/sample';
import SamplePlayInfo from './model/samplePlayInfo';

import { ApiService, IQueuedSample } from './api.service';
import { CatalogService } from './catalog.service';

@Injectable({
  providedIn: 'root'
})
export class PlayListService implements OnDestroy {
  public readonly samplePlayed = new Subject<Readonly<SamplePlayInfo>>();
  private readonly subscriptions = [];
  private playList: Sample[] = [];
  private sampleHistory: SamplePlayInfo[] = [];

  constructor(private readonly api: ApiService, private readonly catalog: CatalogService) {
    this.saveRegistrations([
      this.api.onPlayListSampleEnqueued.subscribe((queuedSample) => this.onItemAddedToPlayList(queuedSample)),
      this.api.onPlayListSamplePopped.subscribe((queuedSample) => this.onItemPoppedFromPlayList(queuedSample)),
      this.api.onPlayListCleared.subscribe(() => this.onClearPlayList())
    ]);
  }

  ngOnDestroy() {
    this.subscriptions.map((r) => r.unsubscribe());
  }

  public enqueueSample(sample: Readonly<Sample>) {
    return this.api.playListEnqueueSample({
      sampleId: sample.getId(),
      category: sample.getCategory().getTitle(),
      title: sample.getTitle(),
    });
  }

  public getPlayList() {
    return this.playList;
  }

  public clearPlayList() {
    return this.api.playListClear();
  }

  public getHistory(lastItems: number = 10): Readonly<SamplePlayInfo>[] {
    return this.sampleHistory.slice(0, lastItems);
  }

  private saveRegistrations(subscriptions: Subscription[]) {
    this.subscriptions.push(...subscriptions);
  }

  private onItemAddedToPlayList(queuedSample: IQueuedSample) {
    const sample = this.catalog.getSampleByQueuedSample(queuedSample);
    if (sample) {
      this.playList.push(sample);
    }
  }

  private onItemPoppedFromPlayList(queuedSample: IQueuedSample) {
    const sample = this.catalog.getSampleByQueuedSample(queuedSample);
    if (sample) {
      const index = this.playList.findIndex(s => s === sample);
      if (index >= 0) {
        this.playList.splice(index, 1);
      }
      this.sampleHistory.unshift(new SamplePlayInfo(sample));
    }
  }

  private onClearPlayList() {
    this.playList.length = 0;
  }
}
