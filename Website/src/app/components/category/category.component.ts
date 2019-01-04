import { Component, Input } from '@angular/core';

import { Category } from '../../model/category';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent {
  @Input() category: Category;
  @Input() filter?: string;

  getTitle = () => {
    let title = this.category.getTitle();
    while (title.startsWith('/')) {
      title = title.substring(1);
    }
    while (title.endsWith('/')) {
      title = title.substring(0, title.length - 1);
    }
    return title;
  }

  getSamples = () => {
    let samples = this.category.getSamples();
    if (this.filter) {
      const lowerCaseFilter = this.filter.toLocaleLowerCase();
      samples = samples.filter((s) => {
        const title = s.getTitle().toLocaleLowerCase();
        return title.indexOf(lowerCaseFilter) >= 0;
      });
    }
    return samples;
  }

  public hasSamples() {
    let samples = this.category.getSamples();
    if (this.filter) {
      const lowerCaseFilter = this.filter.toLocaleLowerCase();
      samples = samples.filter((s) => {
        const title = s.getTitle().toLocaleLowerCase();
        return title.indexOf(lowerCaseFilter) >= 0;
      });
    }
    return samples.length > 0;
  }
}
