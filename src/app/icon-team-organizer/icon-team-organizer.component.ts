import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IconTeamService, Team, Icon, Section, Row } from '../services/icon-team.service';
import { DataPersistenceService } from '../services/data-persistence.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-icon-team-organizer',
  templateUrl: './icon-team-organizer.component.html',
  styleUrls: ['./icon-team-organizer.component.scss']
})
export class IconTeamOrganizerComponent implements OnInit {
  @ViewChild('searchModal') searchModal!: ElementRef;

  teams: Team[] = [];
  icons: Icon[] = [];
  newTeamName = '';
  newTeamColor = '#000000';
  newSectionName = '';
  selectedRow: { teamId: number; sectionId: number; rowId: number } | null = null;
  persistData: boolean = false;
  searchTerm: string = '';
  searchResults: Icon[] = [];
  selectedRowForSearch: { teamId: number; sectionId: number; rowId: number } | null = null;
  isDeleteMode: boolean = false;

  constructor(
    private iconTeamService: IconTeamService,
    private dataPersistenceService: DataPersistenceService
  ) {}

  async ngOnInit() {
    await this.dataPersistenceService.initDB();
    this.loadData();
    this.iconTeamService.teams$.subscribe(teams => {
      this.teams = teams;
      if (this.persistData) {
        this.dataPersistenceService.saveTeams(teams);
      }
    });
    this.iconTeamService.icons$.subscribe(icons => {
      this.icons = icons;
      if (this.persistData) {
        this.dataPersistenceService.saveIcons(icons);
      }
    });
  }

  async loadData() {
    if (this.persistData) {
      const teams = await this.dataPersistenceService.getTeams();
      const icons = await this.dataPersistenceService.getIcons();
      this.iconTeamService.updateTeams(teams);
      this.iconTeamService.updateIcons(icons);
    }
  }

  togglePersistence() {
    this.persistData = !this.persistData;
    if (this.persistData) {
      this.dataPersistenceService.saveTeams(this.teams);
      this.dataPersistenceService.saveIcons(this.icons);
    }
  }

  handleIconUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      Promise.all(files.map(file => this.fileToBase64(file))).then(base64Icons => {
        const newIcons = base64Icons.map((base64, index) => ({
          id: Date.now() + Math.random(),
          name: files[index].name,
          data: base64
        }));
        this.iconTeamService.updateIcons([...this.icons, ...newIcons]);
      });
    }
  }

  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  createTeam() {
    if (this.newTeamName.trim()) {
      const newTeam: Team = {
        id: Date.now(),
        name: this.newTeamName,
        color: this.newTeamColor,
        sections: [
          { id: Date.now(), name: 'pets', rows: [{ id: Date.now(), content: [] }] },
          { id: Date.now() + 1, name: 'subs', rows: [{ id: Date.now() + 2, content: [] }] }
        ]
      };
      this.iconTeamService.addTeam(newTeam);
      this.newTeamName = '';
      this.newTeamColor = '#000000';
    }
  }

  removeTeam(teamId: number) {
    this.iconTeamService.removeTeam(teamId);
  }

  updateTeamColor(teamId: number, event: Event) {
    const target = event.target as HTMLInputElement;
    const color = target.value;
    const updatedTeams = this.teams.map(team =>
      team.id === teamId ? { ...team, color } : team
    );
    this.iconTeamService.updateTeams(updatedTeams);
  }

  addSection(teamId: number) {
    if (this.newSectionName.trim()) {
      const updatedTeams = this.teams.map(team => {
        if (team.id === teamId) {
          return {
            ...team,
            sections: [
              ...team.sections,
              { id: Date.now(), name: this.newSectionName, rows: [{ id: Date.now(), content: [] }] }
            ]
          };
        }
        return team;
      });
      this.iconTeamService.updateTeams(updatedTeams);
      this.newSectionName = '';
    }
  }

  removeSection(teamId: number, sectionId: number) {
    const updatedTeams = this.teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          sections: team.sections.filter(s => s.id !== sectionId)
        };
      }
      return team;
    });
    this.iconTeamService.updateTeams(updatedTeams);
  }

  addRowToSection(teamId: number, sectionId: number) {
    const updatedTeams = this.teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          sections: team.sections.map(section => {
            if (section.id === sectionId) {
              return {
                ...section,
                rows: [...section.rows, { id: Date.now(), content: [] }]
              };
            }
            return section;
          })
        };
      }
      return team;
    });
    this.iconTeamService.updateTeams(updatedTeams);
  }

  removeRowFromSection(teamId: number, sectionId: number) {
    const updatedTeams = this.teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          sections: team.sections.map(section => {
            if (section.id === sectionId && section.rows.length > 1) {
              return {
                ...section,
                rows: section.rows.slice(0, -1)
              };
            }
            return section;
          })
        };
      }
      return team;
    });
    this.iconTeamService.updateTeams(updatedTeams);
  }

  updateRowContent(teamId: number, sectionId: number, rowId: number, newContent: (Icon | string)[]) {
    const updatedTeams = this.teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          sections: team.sections.map(section => {
            if (section.id === sectionId) {
              return {
                ...section,
                rows: section.rows.map(row => 
                  row.id === rowId ? { ...row, content: newContent } : row
                )
              };
            }
            return section;
          })
        };
      }
      return team;
    });
    this.iconTeamService.updateTeams(updatedTeams);
  }

  selectRow(teamId: number, sectionId: number, rowId: number) {
    this.selectedRow = { teamId, sectionId, rowId };
  }

  moveIconToFront(icon: Icon) {
    const iconIndex = this.icons.findIndex(i => i.id === icon.id);
    if (iconIndex > -1) {
      this.icons.splice(iconIndex, 1);
      this.icons.unshift(icon);
      this.iconTeamService.updateIcons(this.icons);
    }
  }

  addIconToSelectedRow(icon: Icon) {
    if (this.selectedRow) {
      const { teamId, sectionId, rowId } = this.selectedRow;
      const team = this.teams.find(t => t.id === teamId);
      if (team) {
        const section = team.sections.find(s => s.id === sectionId);
        if (section) {
          const row = section.rows.find(r => r.id === rowId);
          if (row) {
            const newContent = [...row.content, icon];
            this.updateRowContent(teamId, sectionId, rowId, newContent);
            this.moveIconToFront(icon);
          }
        }
      }
    }
  }

  clearRow() {
    if (this.selectedRow) {
      const { teamId, sectionId, rowId } = this.selectedRow;
      this.updateRowContent(teamId, sectionId, rowId, []);
    }
  }

  resetAllSections() {
    const updatedTeams = this.teams.map(team => ({
      ...team,
      sections: team.sections.map(section => ({
        ...section,
        rows: [{ id: Date.now(), content: [] }]
      }))
    }));
    this.iconTeamService.updateTeams(updatedTeams);
    this.selectedRow = null;
  }

  toggleDeleteMode() {
    this.isDeleteMode = !this.isDeleteMode;
  }

  removeIcon(iconId: number) {
    if (this.isDeleteMode) {
      this.iconTeamService.removeIcon(iconId);
      // Remove the icon from all teams
      const updatedTeams = this.teams.map(team => ({
        ...team,
        sections: team.sections.map(section => ({
          ...section,
          rows: section.rows.map(row => ({
            ...row,
            content: row.content.filter(item => 
              typeof item === 'string' || item.id !== iconId
            )
          }))
        }))
      }));
      this.iconTeamService.updateTeams(updatedTeams);
    }
  }

  isIcon(item: Icon | string): item is Icon {
    return (item as Icon).data !== undefined;
  }

  getIconData(item: Icon | string): string {
    return this.isIcon(item) ? item.data : '';
  }

  getIconName(item: Icon | string): string {
    return this.isIcon(item) ? item.name : '';
  }

  drop(event: CdkDragDrop<(Icon | string)[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
    // Update the content of the affected row
    const [teamId, sectionId, rowId] = event.container.id.split('-').map(Number);
    this.updateRowContent(teamId, sectionId, rowId, event.container.data);
  }

  getConnectedLists(): string[] {
    return this.teams.flatMap(team => 
      team.sections.flatMap(section => 
        section.rows.map(row => `${team.id}-${section.id}-${row.id}`)
      )
    );
  }

  editRowContent(teamId: number, sectionId: number, rowId: number) {
    const team = this.teams.find(t => t.id === teamId);
    if (team) {
      const section = team.sections.find(s => s.id === sectionId);
      if (section) {
        const row = section.rows.find(r => r.id === rowId);
        if (row) {
          const text = prompt('Enter text:');
          if (text !== null && text.trim() !== '') {
            const newContent = [...row.content, text.trim()];
            this.updateRowContent(teamId, sectionId, rowId, newContent);
          }
        }
      }
    }
  }

  addTextToSelectedRow() {
    if (this.selectedRow) {
      const { teamId, sectionId, rowId } = this.selectedRow;
      this.editRowContent(teamId, sectionId, rowId);
    }
  }

  openSearchModal(event: MouseEvent, teamId: number, sectionId: number, rowId: number) {
    event.preventDefault();
    this.selectedRowForSearch = { teamId, sectionId, rowId };
    this.searchTerm = '';
    this.searchResults = [];
    this.searchModal.nativeElement.style.display = 'block';
    this.searchModal.nativeElement.style.left = `${event.clientX}px`;
    this.searchModal.nativeElement.style.top = `${event.clientY}px`;
  }

  closeSearchModal() {
    this.searchModal.nativeElement.style.display = 'none';
    this.selectedRowForSearch = null;
  }

  searchIcons() {
    this.searchResults = this.icons.filter(icon => 
      icon.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  addSearchResultToRow(icon: Icon) {
    if (this.selectedRowForSearch) {
      const { teamId, sectionId, rowId } = this.selectedRowForSearch;
      const team = this.teams.find(t => t.id === teamId);
      if (team) {
        const section = team.sections.find(s => s.id === sectionId);
        if (section) {
          const row = section.rows.find(r => r.id === rowId);
          if (row) {
            const newContent = [...row.content, icon];
            this.updateRowContent(teamId, sectionId, rowId, newContent);
            this.moveIconToFront(icon);
            this.closeSearchModal();
          }
        }
      }
    }
  }
}