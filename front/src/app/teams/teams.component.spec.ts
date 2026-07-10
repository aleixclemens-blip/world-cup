import { TestBed } from '@angular/core/testing';
import { TeamsComponent } from './teams.component';
import { TeamsService } from './services/teams.service';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Team } from './types/teams.types';
import { Router } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';

describe('TeamsComponent', () => {
  let teamsServiceMock: any;
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    teamsServiceMock = {
      getTeams: vi.fn().mockReturnValue(of([])),
      getFavoriteTeams: vi.fn().mockReturnValue(of([])),
      addFavoriteTeam: vi.fn().mockReturnValue(of({ message: 'Success' })),
      removeFavoriteTeam: vi.fn().mockReturnValue(of({ message: 'Success' }))
    };

    authServiceMock = {
      isAuthenticated: vi.fn().mockReturnValue(false)
    };

    routerMock = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [TeamsComponent],
      providers: [
        { provide: TeamsService, useValue: teamsServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();
  });

  it('should create the teams component', () => {
    const fixture = TestBed.createComponent(TeamsComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should load teams on init', async () => {
    const mockData: Team[] = [
      {
        id: 1,
        name: 'Belgium',
        founded: 1895,
        mainStadium: 'King Baudouin Stadium',
        mainStadiumCity: 'Brussels',
        groupId: 6,
        worldCupsWon: 0,
        continentCupsWon: 0,
        continentCupName: 'Eurocup',
        group: {
          id: 6,
          name: 'Group F'
        },
        flag: 'be'
      }
    ];
    teamsServiceMock.getTeams.mockReturnValue(of(mockData));

    const fixture = TestBed.createComponent(TeamsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Wait for initial debounceTime(300) to pass
    await new Promise((resolve) => setTimeout(resolve, 350));
    fixture.detectChanges();

    const expectedData = mockData.map(team => ({
      ...team,
      isFavorite: false,
      isFavoriteLoading: false
    }));

    expect(component['isLoading']()).toBe(false);
    expect(component['error']()).toBeNull();
    expect(component['teams']()).toEqual(expectedData);
  });

  it('should handle error when fetching teams fails', async () => {
    teamsServiceMock.getTeams.mockReturnValue(throwError(() => new Error('API Error')));

    const fixture = TestBed.createComponent(TeamsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Wait for initial debounceTime(300) to pass
    await new Promise((resolve) => setTimeout(resolve, 350));
    fixture.detectChanges();

    expect(component['isLoading']()).toBe(false);
    expect(component['error']()).toContain('No se pudieron cargar');
    expect(component['teams']()).toEqual([]);
  });

  it('should redirect to login when guest tries to toggle favorite', async () => {
    authServiceMock.isAuthenticated.mockReturnValue(false);
    const mockTeam: Team = {
      id: 1,
      name: 'Belgium',
      founded: 1895,
      mainStadium: 'King Baudouin Stadium',
      mainStadiumCity: 'Brussels',
      groupId: 6,
      worldCupsWon: 0,
      continentCupsWon: 0,
      continentCupName: 'Eurocup',
      group: { id: 6, name: 'Group F' },
      flag: 'be'
    };

    const fixture = TestBed.createComponent(TeamsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    await component['toggleFavorite'](mockTeam);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should call addFavoriteTeam when toggling an un-favorited team', async () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);
    const mockTeam: Team = {
      id: 1,
      name: 'Belgium',
      founded: 1895,
      mainStadium: 'King Baudouin Stadium',
      mainStadiumCity: 'Brussels',
      groupId: 6,
      worldCupsWon: 0,
      continentCupsWon: 0,
      continentCupName: 'Eurocup',
      group: { id: 6, name: 'Group F' },
      flag: 'be',
      isFavorite: false
    };

    const fixture = TestBed.createComponent(TeamsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component['teams'].set([mockTeam]);

    await component['toggleFavorite'](mockTeam);

    expect(teamsServiceMock.addFavoriteTeam).toHaveBeenCalledWith(1);
    expect(component['teams']()[0].isFavorite).toBe(true);
  });

  it('should call removeFavoriteTeam when toggling a favorited team', async () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);
    const mockTeam: Team = {
      id: 1,
      name: 'Belgium',
      founded: 1895,
      mainStadium: 'King Baudouin Stadium',
      mainStadiumCity: 'Brussels',
      groupId: 6,
      worldCupsWon: 0,
      continentCupsWon: 0,
      continentCupName: 'Eurocup',
      group: { id: 6, name: 'Group F' },
      flag: 'be',
      isFavorite: true
    };

    const fixture = TestBed.createComponent(TeamsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component['teams'].set([mockTeam]);

    await component['toggleFavorite'](mockTeam);

    expect(teamsServiceMock.removeFavoriteTeam).toHaveBeenCalledWith(1);
    expect(component['teams']()[0].isFavorite).toBe(false);
  });

  it('should mark favorite teams when loaded', async () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);
    const mockData: Team[] = [
      {
        id: 1,
        name: 'Belgium',
        founded: 1895,
        mainStadium: 'King Baudouin Stadium',
        mainStadiumCity: 'Brussels',
        groupId: 6,
        worldCupsWon: 0,
        continentCupsWon: 0,
        continentCupName: 'Eurocup',
        group: { id: 6, name: 'Group F' },
        flag: 'be'
      }
    ];
    teamsServiceMock.getTeams.mockReturnValue(of(mockData));
    teamsServiceMock.getFavoriteTeams.mockReturnValue(of([mockData[0]]));

    const fixture = TestBed.createComponent(TeamsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Wait for initial debounceTime(300) to pass
    await new Promise((resolve) => setTimeout(resolve, 350));
    fixture.detectChanges();

    expect(component['teams']()[0].isFavorite).toBe(true);
  });

  it('should debounce search input changes and load filtered teams', async () => {
    const fixture = TestBed.createComponent(TeamsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    teamsServiceMock.getTeams.mockClear();

    // Simulate typing
    component['onSearchChange']({ target: { value: 'Bel' } } as any);
    expect(component['searchQuery']()).toBe('Bel');
    
    // Wait for debounce (300ms + buffer)
    await new Promise((resolve) => setTimeout(resolve, 350));
    fixture.detectChanges();

    expect(teamsServiceMock.getTeams).toHaveBeenCalledWith('Bel');

    // Test clear search
    teamsServiceMock.getTeams.mockClear();
    component['clearSearch']();
    expect(component['searchQuery']()).toBe('');
    
    await new Promise((resolve) => setTimeout(resolve, 350));
    fixture.detectChanges();
    expect(teamsServiceMock.getTeams).toHaveBeenCalledWith('');
  });
});
