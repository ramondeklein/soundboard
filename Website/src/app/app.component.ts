import { Component, ViewChild } from '@angular/core';
import { ToolBoxComponent } from './components/toolbox/toolbox.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('toolBoxComponent') toolBoxComponent: ToolBoxComponent;
  public filter: string;

  onFilterChanged(newFilter: string) {
    this.filter = newFilter;
  }

  onKey(event: KeyboardEvent) {
    this.toolBoxComponent.setFocus(event.key);
  }
}
