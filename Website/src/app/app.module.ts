import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { MatIconModule, MatButtonModule, MatOptionModule, MatSelectModule } from '@angular/material';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CategoryComponent } from './components/category/category.component';
import { SampleComponent } from './components/sample/sample.component';
import { HistoryComponent } from './components/history/history.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { PlaylistComponent } from './components/playlist/playlist.component';
import { PlayerComponent } from './components/player/player.component';
import { FilterComponent } from './components/filter/filter.component';
import { LogoComponent } from './components/logo/logo.component';


@NgModule({
  declarations: [
    AppComponent,
    CategoryComponent,
    SampleComponent,
    HistoryComponent,
    LogoComponent,
    FilterComponent,
    CategoriesComponent,
    RegistrationComponent,
    PlaylistComponent,
    PlayerComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    MatOptionModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
