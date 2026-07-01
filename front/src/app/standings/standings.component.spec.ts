import { TestBed } from '@angular/core/testing';
import { StandingsComponent } from './standings.component';
import { StandingsService } from './services/standings.service';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

describe('StandingsComponent', () => {
  let standingsServiceMock: any;

  beforeEach(async () => {
    standingsServiceMock = {
      getStandings: vi.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [StandingsComponent],
      providers: [
        { provide: StandingsService, useValue: standingsServiceMock }
      ]
    }).compileComponents();
  });

  it('should create the standings component', () => {
    const fixture = TestBed.createComponent(StandingsComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should load standings on init', async () => {
    const mockData = [
      {
        groupName: 'Grupo A',
        teams: [
          {
            rank: 1,
            group: 'Group A',
            teamId: 1,
            teamName: 'Netherlands',
            gamesWon: 2,
            gamesDraw: 1,
            gamesLost: 0,
            goalsFor: 5,
            goalsAgainst: 1,
            points: 7,
            flag: 'nl',
            goalsDiff: 4,
            played: 3
          }
        ]
      }
    ];
    standingsServiceMock.getStandings.mockReturnValue(of(mockData));

    const fixture = TestBed.createComponent(StandingsComponent);
    const component = fixture.componentInstance;
    await component['loadStandings']();

    expect(component['isLoading']()).toBe(false);
    expect(component['error']()).toBeNull();
    expect(component['groups']()).toEqual(mockData);
  });

  it('should handle error when fetching standings fails', async () => {
    standingsServiceMock.getStandings.mockReturnValue(throwError(() => new Error('API Error')));

    const fixture = TestBed.createComponent(StandingsComponent);
    const component = fixture.componentInstance;
    await component['loadStandings']();

    expect(component['isLoading']()).toBe(false);
    expect(component['error']()).toContain('No se pudieron cargar');
    expect(component['groups']()).toEqual([]);
  });
});


