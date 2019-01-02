import { Component } from '@angular/core';
import { PlayListService } from '../playlist.service';
import SamplePlayInfo from '../model/samplePlayInfo';
import formatDate from 'src/utils/formatDate';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent {
  constructor(private readonly playListService: PlayListService) {
  }

  onPlay(sample: Readonly<SamplePlayInfo>): void {
    this.playListService.enqueueSample(sample.getSample());
  }

  getSamples() {
    return this.playListService.getHistory();
  }

  formatDate(date?: Date) {
    return formatDate(date);
  }
}
