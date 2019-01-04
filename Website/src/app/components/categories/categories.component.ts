import { Component } from '@angular/core';

import { CatalogService} from '../../services/catalog.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent {
  public filter?: string;

  constructor(private catalogService: CatalogService) {
  }

  public getCatagories() {
    return this.catalogService.getCatagories();
  }

  public onKey(event: any) {
    if (event.target.value) {
      this.filter = event.target.value;
    } else {
      this.filter = undefined;
    }
  }

  public onScan() {
    this.catalogService.scan().subscribe();
  }

  public onRefresh() {
    this.catalogService.refresh();
  }
}
