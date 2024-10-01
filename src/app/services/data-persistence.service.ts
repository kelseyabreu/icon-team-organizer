import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';
import { Team, Icon } from './icon-team.service';

@Injectable({
  providedIn: 'root'
})
export class DataPersistenceService {
  private db!: IDBPDatabase;

  async initDB() {
    this.db = await openDB('IconTeamOrganizerDB', 1, {
      upgrade(db) {
        db.createObjectStore('teams');
        db.createObjectStore('icons');
      },
    });
  }

  async saveTeams(teams: Team[]) {
    await this.db.put('teams', teams, 'teams');
  }

  async getTeams(): Promise<Team[]> {
    return await this.db.get('teams', 'teams') || [];
  }

  async saveIcons(icons: Icon[]) {
    await this.db.put('icons', icons, 'icons');
  }

  async getIcons(): Promise<Icon[]> {
    return await this.db.get('icons', 'icons') || [];
  }
}