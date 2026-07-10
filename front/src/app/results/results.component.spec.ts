import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ResultsComponent } from './results.component';
import { ResultsService } from './services/results.service';
import { TeamsService } from '../teams/services/teams.service';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Team } from '../teams/types/teams.types';

describe('ResultsComponent', () => {
  let resultsServiceMock: any;
  let teamsServiceMock: any;

  const mockTeams = [
    {
      id: 26,
      name: 'Argentina',
      founded: 1893,
      mainStadium: 'Estadio Monumental',
      mainStadiumCity: 'Buenos Aires',
      groupId: 3,
      worldCupsWon: 3,
      continentCupsWon: 15,
      continentCupName: 'Copa América',
      group: { id: 3, name: 'Group C' },
      flag: 'ar'
    },
    {
      id: 2,
      name: 'France',
      founded: 1919,
      mainStadium: 'Stade de France',
      mainStadiumCity: 'Saint-Denis',
      groupId: 4,
      worldCupsWon: 2,
      continentCupsWon: 2,
      continentCupName: 'UEFA Euro',
      group: { id: 4, name: 'Group D' },
      flag: 'fr'
    }
  ] as Team[];

  const mockFixtures = [
    {
      id: 979139,
      referee: 'S. Marciniak',
      stadium: 'Lusail Iconic Stadium',
      stadiumCity: 'Lusail',
      homeTeamId: 26,
      homeTeamName: 'Argentina',
      awayTeamId: 2,
      awayTeamName: 'France',
      round: 'Final',
      goalsHome: 3,
      goalsAway: 3,
      penaltiesHome: 4,
      penaltiesAway: 2,
      homeTeam: { id: 26, name: 'Argentina', group: { id: 3, name: 'Group C' } },
      awayTeam: { id: 2, name: 'France', group: { id: 4, name: 'Group D' } },
      events: [
        {
          id: 167,
          fixtureId: 979139,
          type: 'Goal',
          minute: 23,
          extraMinute: null,
          playerName: 'L. Messi',
          teamId: 26,
          teamName: 'Argentina'
        },
        {
          id: 171,
          fixtureId: 979139,
          type: 'Goal',
          minute: 108,
          extraMinute: null,
          playerName: 'L. Messi',
          teamId: 26,
          teamName: 'Argentina'
        },
        {
          id: 169,
          fixtureId: 979139,
          type: 'Goal',
          minute: 80,
          extraMinute: null,
          playerName: 'K. Mbappé',
          teamId: 2,
          teamName: 'France'
        }
      ],
      homeTeamFlag: 'ar',
      awayTeamFlag: 'fr'
    }
  ];

  beforeEach(async () => {
    resultsServiceMock = {
      getFixtures: vi.fn().mockReturnValue(of(mockFixtures))
    };

    teamsServiceMock = {
      getTeams: vi.fn().mockReturnValue(of(mockTeams))
    };

    await TestBed.configureTestingModule({
      imports: [ResultsComponent],
      providers: [
        provideRouter([]),
        { provide: ResultsService, useValue: resultsServiceMock },
        { provide: TeamsService, useValue: teamsServiceMock }
      ]
    }).compileComponents();
  });

  it('should create the results component', () => {
    const fixture = TestBed.createComponent(ResultsComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should load teams and fixtures on init', () => {
    const fixture = TestBed.createComponent(ResultsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(teamsServiceMock.getTeams).toHaveBeenCalled();
    expect(resultsServiceMock.getFixtures).toHaveBeenCalledWith({
      round: undefined,
      group: undefined,
      teamId: undefined
    });
    expect(component['allTeams']()).toEqual(mockTeams);
    expect(component['fixtures']()).toEqual(mockFixtures);
    expect(component['isLoading']()).toBe(false);
    expect(component['error']()).toBeNull();
  });

  it('should filter fixtures when round or group changes', () => {
    const fixture = TestBed.createComponent(ResultsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Trigger round change
    const roundEvent = { target: { value: 'Final' } } as unknown as Event;
    component['onRoundChange'](roundEvent);
    fixture.detectChanges();
    expect(component['selectedRound']()).toBe('Final');
    expect(resultsServiceMock.getFixtures).toHaveBeenLastCalledWith({
      round: 'Final',
      group: undefined,
      teamId: undefined
    });

    // Trigger group change
    const groupEvent = { target: { value: 'Group C' } } as unknown as Event;
    component['onGroupChange'](groupEvent);
    fixture.detectChanges();
    expect(component['selectedGroup']()).toBe('Group C');
    expect(resultsServiceMock.getFixtures).toHaveBeenLastCalledWith({
      round: 'Final',
      group: 'Group C',
      teamId: undefined
    });
  });

  it('should manage team autocomplete logic', () => {
    const fixture = TestBed.createComponent(ResultsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Type query
    const inputEvent = { target: { value: 'Arge' } } as unknown as Event;
    component['onTeamSearchChange'](inputEvent);
    expect(component['teamSearchQuery']()).toBe('Arge');
    expect(component['suggestedTeams']()).toEqual([mockTeams[0]]);

    // Select suggestion
    component['selectTeam'](mockTeams[0]);
    fixture.detectChanges();
    expect(component['selectedTeam']()).toEqual(mockTeams[0]);
    expect(component['teamSearchQuery']()).toBe('Argentina');
    expect(component['showSuggestions']()).toBe(false);
    expect(resultsServiceMock.getFixtures).toHaveBeenLastCalledWith({
      round: undefined,
      group: undefined,
      teamId: 26
    });

    // Clear filter
    component['clearTeamFilter']();
    fixture.detectChanges();
    expect(component['selectedTeam']()).toBeNull();
    expect(component['teamSearchQuery']()).toBe('');
    expect(resultsServiceMock.getFixtures).toHaveBeenLastCalledWith({
      round: undefined,
      group: undefined,
      teamId: undefined
    });
  });

  it('should clear all filters at once', () => {
    const fixture = TestBed.createComponent(ResultsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Set filters
    component['selectedRound'].set('Final');
    component['selectedGroup'].set('Group C');
    component['selectedTeam'].set(mockTeams[0]);
    component['teamSearchQuery'].set('Argentina');
    fixture.detectChanges();

    component['clearAllFilters']();
    fixture.detectChanges();

    expect(component['selectedRound']()).toBe('');
    expect(component['selectedGroup']()).toBe('');
    expect(component['selectedTeam']()).toBeNull();
    expect(component['teamSearchQuery']()).toBe('');
    expect(resultsServiceMock.getFixtures).toHaveBeenLastCalledWith({
      round: undefined,
      group: undefined,
      teamId: undefined
    });
  });

  it('should correctly group goal scorers and format their minutes', () => {
    const fixture = TestBed.createComponent(ResultsComponent);
    const component = fixture.componentInstance;

    const argentinaScorers = component['getGroupedScorers'](mockFixtures[0], 26);
    expect(argentinaScorers).toEqual([
      { playerName: 'L. Messi', minutes: '23\', 108\'' }
    ]);

    const franceScorers = component['getGroupedScorers'](mockFixtures[0], 2);
    expect(franceScorers).toEqual([
      { playerName: 'K. Mbappé', minutes: '80\'' }
    ]);
  });

  it('should correctly detect penalty shootouts', () => {
    const fixture = TestBed.createComponent(ResultsComponent);
    const component = fixture.componentInstance;

    expect(component['hasShootout'](mockFixtures[0])).toBe(true);

    const normalFixture = {
      ...mockFixtures[0],
      penaltiesHome: null,
      penaltiesAway: null
    };
    expect(component['hasShootout'](normalFixture)).toBe(false);
  });

  it('should handle API error gracefully', () => {
    resultsServiceMock.getFixtures.mockReturnValue(throwError(() => new Error('API Error')));

    const fixture = TestBed.createComponent(ResultsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component['isLoading']()).toBe(false);
    expect(component['error']()).toContain('No se pudieron cargar');
    expect(component['fixtures']()).toEqual([]);
  });
});
