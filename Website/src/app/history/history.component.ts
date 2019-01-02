import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PlayService } from '../play.service';
import SamplePlayInfo from '../model/samplePlayInfo';
import formatDate from 'src/utils/formatDate';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit, OnDestroy {
  private static readonly maxHistorySize = 10;
  private subscription: Subscription;
  public lastSamples: Readonly<SamplePlayInfo>[];

  constructor(private playService: PlayService) {
  }

  ngOnInit(): void {
    this.lastSamples = this.playService.getHistory(HistoryComponent.maxHistorySize);
    this.subscription = this.playService.samplePlayed.subscribe((s) => this.addSample(s));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private addSample(sample: Readonly<SamplePlayInfo>) {
    this.lastSamples.unshift(sample);
    if (this.lastSamples.length > HistoryComponent.maxHistorySize) {
      this.lastSamples.length = HistoryComponent.maxHistorySize;
    }
  }

  onPlay(sample: Readonly<SamplePlayInfo>): void {
    this.playService.enqueueSample(sample.getSample());
  }

  formatDate(date?: Date) {
    return formatDate(date);
  }

}
