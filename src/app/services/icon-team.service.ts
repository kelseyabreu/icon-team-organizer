import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Icon {
    id: number;
    name: string;
    data: string;  // This will store the base64 data
  }

export interface Row {
  id: number;
  content: (Icon | string)[];
}

export interface Section {
  id: number;
  name: string;
  rows: Row[];
}

export interface Team {
  id: number;
  name: string;
  color: string;
  sections: Section[];
}

@Injectable({
  providedIn: 'root'
})
export class IconTeamService {
  private teamsSubject = new BehaviorSubject<Team[]>([]);
  private iconsSubject = new BehaviorSubject<Icon[]>([]);

  teams$ = this.teamsSubject.asObservable();
  icons$ = this.iconsSubject.asObservable();

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    const storedTeams = localStorage.getItem('teams');
    const storedIcons = localStorage.getItem('icons');
    if (storedTeams) this.teamsSubject.next(JSON.parse(storedTeams));
    if (storedIcons) this.iconsSubject.next(JSON.parse(storedIcons));
  }

  saveToLocalStorage() {
    localStorage.setItem('teams', JSON.stringify(this.teamsSubject.value));
    localStorage.setItem('icons', JSON.stringify(this.iconsSubject.value));
  }

  updateTeams(teams: Team[]) {
    this.teamsSubject.next(teams);
    this.saveToLocalStorage();
  }

  updateIcons(icons: Icon[]) {
    this.iconsSubject.next(icons);
    this.saveToLocalStorage();
  }

  getTeams(): Team[] {
    return this.teamsSubject.value;
  }

  getIcons(): Icon[] {
    return this.iconsSubject.value;
  }

//   getIconUrl(item: Icon | string): string {
//     return this.isIcon(item) ? item.data : '';
//   }

  addTeam(team: Team) {
    const currentTeams = this.getTeams();
    this.updateTeams([...currentTeams, team]);
  }

  addIcon(icon: Icon) {
    const currentIcons = this.getIcons();
    this.updateIcons([...currentIcons, icon]);
  }

  removeTeam(teamId: number) {
    const currentTeams = this.getTeams();
    this.updateTeams(currentTeams.filter(team => team.id !== teamId));
  }

  removeIcon(iconId: number) {
    const currentIcons = this.getIcons();
    this.updateIcons(currentIcons.filter(icon => icon.id !== iconId));

    const currentTeams = this.getTeams();
    const updatedTeams = currentTeams.map(team => ({
      ...team,
      sections: team.sections.map(section => ({
        ...section,
        rows: section.rows.map(row => ({
          ...row,
          content: row.content.filter(item => typeof item !== 'object' || item.id !== iconId)
        }))
      }))
    }));
    this.updateTeams(updatedTeams);
  }

  calculateIconUsage(): { [key: number]: number } {
    const usage: { [key: number]: number } = {};
    const icons = this.getIcons();
    const teams = this.getTeams();

    icons.forEach(icon => { usage[icon.id] = 0; });
    teams.forEach(team => {
      team.sections.forEach(section => {
        section.rows.forEach(row => {
          row.content.forEach(item => {
            if (typeof item === 'object' && item.id) {
              usage[item.id] = (usage[item.id] || 0) + 1;
            }
          });
        });
      });
    });
    return usage;
  }
}