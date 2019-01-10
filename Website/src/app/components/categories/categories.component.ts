import { Component, Input, OnInit, OnDestroy } from '@angular/core';

import { CatalogService} from '../../services/catalog.service';
import { Category } from 'src/app/model/category';
import { SubscriptionContainer } from 'src/app/utils/subscriptionContainer';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, OnDestroy {
  private readonly subscriptionContainer = new SubscriptionContainer();
  public categories: Category[] = [];
  @Input() filter?: string;

  constructor(private catalogService: CatalogService) {
  }

  async ngOnInit() {
    this.categories = await this.catalogService.getCategories();
    this.subscriptionContainer.addSubscription(
      this.catalogService.refreshed.subscribe((categories) => this.categories = categories)
    );
  }

  ngOnDestroy() {
    this.subscriptionContainer.unSubscribeAll();
  }
}
