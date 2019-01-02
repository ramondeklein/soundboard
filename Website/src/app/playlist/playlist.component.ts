import { Component } from '@angular/core';
import { PlayService } from '../play.service';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent {

  constructor(private readonly playService: PlayService) {
  }

  getSamples() {
    return this.playService.getPlayList();
  }

  clearPlayList() {
    return this.playService.clearPlayList();
  }
}
