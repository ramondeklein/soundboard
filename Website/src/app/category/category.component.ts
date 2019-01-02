import { Component, Input } from '@angular/core';
import Category from '../model/category';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent {
    @Input() category: Category;

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
}
