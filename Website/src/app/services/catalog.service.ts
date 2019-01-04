import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Sample } from '../model/sample';
import { Category } from '../model/category';
import { IBackEndSample } from '../model/IBackEndSample';
import { ApiService, IQueuedSample } from './api.service';
import { SubscriptionContainer } from '../utils/subscriptionContainer';

const compareNames = (n1: string, n2: string) => {
  if (n1 < n2) {
    return -1;
  } else if (n1 > n2) {
    return 1;
  } else {
    return 0;
  }
};

@Injectable({
  providedIn: 'root'
})
export class CatalogService implements OnDestroy {
  public readonly refreshed = new Subject<Category[]>();
  public readonly sampleUpdated = new Subject<Readonly<Sample>>();
  private readonly subscriptionContainer: SubscriptionContainer;
  private categories: Category[] = [];

  constructor(private readonly api: ApiService) {
    this.subscriptionContainer = new SubscriptionContainer(
      this.api.onScan.subscribe(() => this.refresh().subscribe()),
      this.api.onSampleUpdated.subscribe((backEndSample) => this.onSampleUpdated(backEndSample))
    );
    this.refresh().subscribe();
  }

  ngOnDestroy() {
    this.subscriptionContainer.unSubscribeAll();
  }

  public scan() {
    return this.api.sampleScan();
  }

  public refresh() {
    return this.getCategories().pipe(map((_) => { }));
  }

  public getCatagories() {
    return this.categories;
  }

  public getSampleByQueuedSample(queuedSample: IQueuedSample) {
    if (queuedSample) {
      const category = this.categories.find(c => c.getTitle() === queuedSample.category);
      if (category) {
        const sample = category.getSamples().find(s => s.getId() === queuedSample.sampleId);
        if (sample) {
          return sample;
        }
      }
    }
  }

  private getCategories(): Observable<Category[]> {
    return this.api.sampleGetAll().pipe(map(backEndSamples => {
      const categories: Category[] = [];
      for (const backEndSample of backEndSamples) {
        for (const backEndLocation of backEndSample.locations) {
          const categoryName = backEndLocation.category;
          let category = categories.find(c => c.getTitle() === categoryName);
          if (category == null) {
            category = new Category(categoryName);
            categories.push(category);
          }
          category.addSample(new Sample(category, backEndLocation.title, backEndSample));
        }
      }
      for (const category of categories) {
        category.getSamples().sort((s1, s2) => compareNames(s1.getTitle(), s2.getTitle()));
      }
      categories.sort((c1, c2) => compareNames(c1.getTitle(), c2.getTitle()));
      this.categories = categories;
      this.refreshed.next();
      return categories;
    }));
  }

  private onSampleUpdated(backEndSample: IBackEndSample) {
    // TODO: Also update locations and categories
    for (const category of this.categories) {
      for (const sample of category.getSamples()) {
        if (sample.getId() === backEndSample.id) {
          sample.updateFrom(backEndSample);
        }
      }
    }
  }
}
