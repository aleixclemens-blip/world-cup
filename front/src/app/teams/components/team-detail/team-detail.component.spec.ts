import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TeamDetailComponent } from './team-detail.component';
import { TeamsService } from '../../services/teams.service';
import { ResultsService } from '../../../results/services/results.service';
import { AuthService } from '../../../auth/services/auth.service';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

describe('TeamDetailComponent', () => {
  let teamsServiceMock: any;
  let resultsServiceMock: any;
  let authServiceMock: any;
  let routerMock: any;
  let locationMock: any;
  let activatedRouteMock: any;

  const mockTeam = {
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
    flag: 'ar',
    isFavorite: false
  };

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
        }
      ],
      homeTeamFlag: 'ar',
      awayTeamFlag: 'fr'
    }
  ];

  beforeEach(async () => {
    teamsServiceMock = {
      getTeamById: vi.fn().mockReturnValue(of(mockTeam)),
      getFavoriteTeams: vi.fn().mockReturnValue(of([])),
      addFavoriteTeam: vi.fn().mockReturnValue(of({ message: 'Success' })),
      removeFavoriteTeam: vi.fn().mockReturnValue(of({ message: 'Success' }))
    };

    resultsServiceMock = {
      getFixtures: vi.fn().mockReturnValue(of(mockFixtures))
    };

    authServiceMock = {
      isAuthenticated: vi.fn().mockReturnValue(true)
    };

    routerMock = {
      navigate: vi.fn()
    };

    locationMock = {
      back: vi.fn()
    };

    activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: vi.fn().mockReturnValue('26')
        }
      },
      paramMap: of({
        get: (key: string) => '26'
      })
    };

    await TestBed.configureTestingModule({
      imports: [TeamDetailComponent],
      providers: [
        { provide: TeamsService, useValue: teamsServiceMock },
        { provide: ResultsService, useValue: resultsServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: Location, useValue: locationMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();
  });

  it('should create the team detail component', () => {
    const fixture = TestBed.createComponent(TeamDetailComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should load team details and matches on init', () => {
    const fixture = TestBed.createComponent(TeamDetailComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(teamsServiceMock.getTeamById).toHaveBeenCalledWith(26);
    expect(teamsServiceMock.getFavoriteTeams).toHaveBeenCalled();
    expect(resultsServiceMock.getFixtures).toHaveBeenCalledWith({ teamId: 26 });
    expect(component['team']()).toEqual({ ...mockTeam, isFavorite: false });
    expect(component['fixtures']()).toEqual(mockFixtures);
    expect(component['isLoading']()).toBe(false);
    expect(component['error']()).toBeNull();
  });

  it('should navigate back when goBack is called', () => {
    const fixture = TestBed.createComponent(TeamDetailComponent);
    const component = fixture.componentInstance;
    component['goBack']();
    expect(locationMock.back).toHaveBeenCalled();
  });

  it('should toggle favorite status when toggleFavorite is called', async () => {
    const fixture = TestBed.createComponent(TeamDetailComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Call toggleFavorite (adds to favorites)
    await component['toggleFavorite']();
    expect(teamsServiceMock.addFavoriteTeam).toHaveBeenCalledWith(26);
    expect(component['team']()?.isFavorite).toBe(true);

    // Call toggleFavorite again (removes from favorites)
    await component['toggleFavorite']();
    expect(teamsServiceMock.removeFavoriteTeam).toHaveBeenCalledWith(26);
    expect(component['team']()?.isFavorite).toBe(false);
  });

  it('should redirect to login if unauthenticated when adding to favorites', async () => {
    authServiceMock.isAuthenticated.mockReturnValue(false);
    const fixture = TestBed.createComponent(TeamDetailComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    await component['toggleFavorite']();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    expect(teamsServiceMock.addFavoriteTeam).not.toHaveBeenCalled();
  });

  it('should handle load errors gracefully', () => {
    teamsServiceMock.getTeamById.mockReturnValue(throwError(() => new Error('API Error')));
    const fixture = TestBed.createComponent(TeamDetailComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component['isLoading']()).toBe(false);
    expect(component['error']()).toContain('No se pudo cargar');
    expect(component['team']()).toBeNull();
  });
});
