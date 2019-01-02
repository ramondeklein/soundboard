import { Component } from '@angular/core';
import { CatalogService} from '../catalog.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent {
  constructor(private catalogService: CatalogService) {
  }

  public getCatagories()
  {
    return this.catalogService.getCatagories();
  }

  public onScan() {
    this.catalogService.scan().subscribe();
  }

  public onRefresh() {
    this.catalogService.refresh();
  }
}
