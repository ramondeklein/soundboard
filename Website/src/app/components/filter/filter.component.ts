import { Component, Output, EventEmitter, Input } from '@angular/core';

import { CatalogService } from '../../services/catalog.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent {
  private filter?: string;
  @Output() filterChanged = new EventEmitter<string>();

  constructor(private readonly catalogService: CatalogService) {
  }

  public onKey(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Escape') {
      input.value = '';
      this.setFilter(undefined);
    } else if (input.value) {
      this.setFilter(input.value);
    } else {
      this.setFilter(undefined);
    }
  }

  public onScan() {
    this.catalogService.scan().subscribe();
  }

  public onRefresh() {
    this.catalogService.refresh();
  }

  private setFilter(filter?: string) {
    if (this.filter !== filter) {
      this.filter = filter;
      this.filterChanged.emit(this.filter);
    }
  }

  public setFocus(key: string) {
    if (key.length === 1) {
      if (this.filter) {
        this.filter += key;
      } else {
        this.filter = key;
      }
    }
  }
}
