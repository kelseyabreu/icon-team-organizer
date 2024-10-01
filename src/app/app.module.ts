import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppComponent } from './app.component';
import { IconTeamOrganizerComponent } from './icon-team-organizer/icon-team-organizer.component';
import { DisplayPageComponent } from './display-page/display-page.component';
import { IconTeamService } from './services/icon-team.service';

@NgModule({
  declarations: [
    AppComponent,
    IconTeamOrganizerComponent,
    DisplayPageComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    DragDropModule
  ],
  providers: [IconTeamService],
  bootstrap: [AppComponent]
})
export class AppModule { }
