import { Component, OnInit } from '@angular/core';
import Category from '../model/category';
import { PlayService} from '../play.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  public categories: Category[];

  constructor(private playService: PlayService) {
  }

  ngOnInit() {
    this.playService.getCategories().subscribe((categories) => this.categories = categories);
  }
}
