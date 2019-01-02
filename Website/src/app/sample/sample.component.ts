import { Component, Input } from '@angular/core';
import Sample from '../model/sample';
import { PlayService } from '../play.service';
import formatDate from 'src/utils/formatDate';

@Component({
  selector: 'app-sample',
  templateUrl: './sample.component.html',
  styleUrls: ['./sample.component.scss']
})
export class SampleComponent {
  @Input() sample: Sample;

  constructor(private playService: PlayService) {
  }

  formatDate(date?: Date) {
    return formatDate(date);
  }

  onPlay(): void {
    this.playService.enqueueSample(this.sample);
  }
}
