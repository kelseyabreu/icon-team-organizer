import { Component, OnInit } from '@angular/core';
import { IconTeamService, Team, Icon } from '../services/icon-team.service';

@Component({
  selector: 'app-display-page',
  templateUrl: './display-page.component.html',
  styleUrls: ['./display-page.component.scss']
})
export class DisplayPageComponent implements OnInit {
  teams: Team[] = [];
  icons: Icon[] = [];

  constructor(private iconTeamService: IconTeamService) {}

  ngOnInit() {
    this.iconTeamService.teams$.subscribe(teams => this.teams = teams);
    this.iconTeamService.icons$.subscribe(icons => this.icons = icons);
  }

  calculateIconUsage(): { [key: number]: number } {
    return this.iconTeamService.calculateIconUsage();
  }

  isIcon(item: Icon | string): item is Icon {
    return (item as Icon).data !== undefined;
  }
}