import { Component } from '@angular/core';

import { SamplePlayInfo } from '../../model/samplePlayInfo';
import { PlayListService } from '../../services/playlist.service';
import { formatDate } from '../../utils/formatDate';

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
