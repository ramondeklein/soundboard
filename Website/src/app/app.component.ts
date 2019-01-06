import { Component, ViewChild } from '@angular/core';
import { FilterComponent } from './components/filter/filter.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('filterComponent') filterComponent: FilterComponent;
  public filter: string;

  onFilterChanged(newFilter: string) {
    this.filter = newFilter;
  }

  onKey(event: KeyboardEvent) {
    this.filterComponent.setFocus(event.key);
  }
}
