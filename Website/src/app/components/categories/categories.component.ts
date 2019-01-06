import { Component, Input } from '@angular/core';

import { CatalogService} from '../../services/catalog.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent {
  @Input() filter?: string;

  constructor(private catalogService: CatalogService) {
  }

  public getCatagories() {
    return this.catalogService.getCatagories();
  }
}
