import { Injectable, OnDestroy } from '@angular/core';

import { Sample } from '../model/sample';
import { SamplePlayInfo } from '../model/samplePlayInfo';
import { ApiService, IQueuedSample } from './api.service';
import { CatalogService } from './catalog.service';
import { SubscriptionContainer } from '../utils/subscriptionContainer';

@Injectable({
  providedIn: 'root'
})
export class PlayListService implements OnDestroy {
  private readonly subscriptionContainer: SubscriptionContainer;
  private playList: Sample[] = [];
  private sampleHistory: SamplePlayInfo[] = [];

  constructor(private readonly api: ApiService, private readonly catalog: CatalogService) {
    this.subscriptionContainer = new SubscriptionContainer(
      this.api.onPlayListSampleEnqueued.subscribe((queuedSample) => this.onItemAddedToPlayList(queuedSample)),
      this.api.onPlayListSamplePopped.subscribe((queuedSample) => this.onItemPoppedFromPlayList(queuedSample)),
      this.api.onPlayListCleared.subscribe(() => this.onClearPlayList())
    );
  }

  ngOnDestroy() {
    this.subscriptionContainer.unSubscribeAll();
  }

  public async enqueueSample(sample: Readonly<Sample>) {
    await this.api.playListEnqueueSample({
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

  private async onItemAddedToPlayList(queuedSample: IQueuedSample) {
    const sample = await this.catalog.getSampleByQueuedSample(queuedSample);
    if (sample) {
      this.playList.push(sample);
    }
  }

  private async onItemPoppedFromPlayList(queuedSample: IQueuedSample) {
    const sample = await this.catalog.getSampleByQueuedSample(queuedSample);
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
