import { Component, Input } from '@angular/core';
import Sample from '../model/sample';
import { PlayListService } from '../playlist.service';
import formatDate from 'src/utils/formatDate';

@Component({
  selector: 'app-sample',
  templateUrl: './sample.component.html',
  styleUrls: ['./sample.component.scss']
})
export class SampleComponent {
  @Input() sample: Sample;

  constructor(private playListService: PlayListService) {
  }

  formatDate(date?: Date) {
    return formatDate(date);
  }

  onPlay(): void {
    this.playListService.enqueueSample(this.sample).subscribe();
  }
}
