import { Component } from '@angular/core';
import { PlayListService } from '../../services/playlist.service';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent {

  constructor(private readonly playListService: PlayListService) {
  }

  getSamples() {
    return this.playListService.getPlayList();
  }

  public async onClear() {
    await this.playListService.clearPlayList();
  }
}
