import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconTeamOrganizerComponent } from './icon-team-organizer.component';

describe('IconTeamOrganizerComponent', () => {
  let component: IconTeamOrganizerComponent;
  let fixture: ComponentFixture<IconTeamOrganizerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IconTeamOrganizerComponent]
    });
    fixture = TestBed.createComponent(IconTeamOrganizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
