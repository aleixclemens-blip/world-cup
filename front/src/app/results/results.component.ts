import { Component, signal, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { ResultsService } from './services/results.service';
import { TeamsService } from '../teams/services/teams.service';
import { Team } from '../teams/types/teams.types';
import { Fixture } from './types/results.types';

export interface FilterOption {
  value: string;
  label: string;
}

export interface GroupedScorer {
  playerName: string;
  minutes: string;
}

@Component({
  selector: 'app-results',
  imports: [RouterLink],
  templateUrl: './results.component.html'
})
export class ResultsComponent {
  private readonly resultsService = inject(ResultsService);
  private readonly teamsService = inject(TeamsService);

  // Filter States
  protected readonly selectedRound = signal<string>('');
  protected readonly selectedGroup = signal<string>('');
  protected readonly selectedTeam = signal<Team | null>(null);

  // Search & Autocomplete States
  protected readonly teamSearchQuery = signal<string>('');
  protected readonly showSuggestions = signal<boolean>(false);

  // Static Dropdown Options
  protected readonly roundOptions: FilterOption[] = [
    { value: '', label: 'Todas las rondas' },
    { value: 'Group Stage - 1', label: 'Fase de Grupos - Jornada 1' },
    { value: 'Group Stage - 2', label: 'Fase de Grupos - Jornada 2' },
    { value: 'Group Stage - 3', label: 'Fase de Grupos - Jornada 3' },
    { value: 'Round of 16', label: 'Octavos de final' },
    { value: 'Quarter-finals', label: 'Cuartos de final' },
    { value: 'Semi-finals', label: 'Semifinales' },
    { value: 'Third place play-off', label: 'Tercer puesto' },
    { value: 'Final', label: 'Final' }
  ];

  protected readonly groupOptions: FilterOption[] = [
    { value: '', label: 'Todos los grupos' },
    { value: 'Group A', label: 'Grupo A' },
    { value: 'Group B', label: 'Grupo B' },
    { value: 'Group C', label: 'Grupo C' },
    { value: 'Group D', label: 'Grupo D' },
    { value: 'Group E', label: 'Grupo E' },
    { value: 'Group F', label: 'Grupo F' },
    { value: 'Group G', label: 'Grupo G' },
    { value: 'Group H', label: 'Grupo H' }
  ];

  // Load all teams reactively for the autocomplete input
  protected readonly allTeams = toSignal(
    this.teamsService.getTeams().pipe(
      catchError((err) => {
        console.error('Error fetching autocomplete teams:', err);
        return of([]);
      })
    ),
    { initialValue: [] }
  );

  // Derived signal for team suggestions matching the search query
  protected readonly suggestedTeams = computed(() => {
    const query = this.teamSearchQuery().toLowerCase().trim();
    const teams = this.allTeams();
    if (!query) {
      return teams;
    }
    return teams.filter((t) => t.name.toLowerCase().includes(query));
  });

  // Writable states controlled within the reactive stream
  protected readonly isLoading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);

  protected readonly retryTrigger = signal<number>(0);

  // Grouped active filters signal
  private readonly filters = computed(() => ({
    round: this.selectedRound(),
    group: this.selectedGroup(),
    teamId: this.selectedTeam()?.id,
    retry: this.retryTrigger()
  }));

  // Declaratively query fixtures whenever the computed active filters emit a new value
  protected readonly fixtures = toSignal(
    toObservable(this.filters).pipe(
      tap(() => {
        this.isLoading.set(true);
        this.error.set(null);
      }),
      switchMap((currentFilters) =>
        this.resultsService
          .getFixtures({
            round: currentFilters.round || undefined,
            group: currentFilters.group || undefined,
            teamId: currentFilters.teamId
          })
          .pipe(
            catchError((err) => {
              console.error('Error fetching fixtures:', err);
              this.error.set('No se pudieron cargar los resultados. Por favor, inténtelo de nuevo.');
              return of([]);
            })
          )
      ),
      tap(() => this.isLoading.set(false))
    ),
    { initialValue: [] }
  );

  protected onRoundChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedRound.set(val);
  }

  protected onGroupChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedGroup.set(val);
  }

  protected onTeamSearchChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.teamSearchQuery.set(val);
    if (!val.trim()) {
      this.selectedTeam.set(null);
    }
  }

  protected selectTeam(team: Team): void {
    this.selectedTeam.set(team);
    this.teamSearchQuery.set(team.name);
    this.showSuggestions.set(false);
  }

  protected clearTeamFilter(): void {
    this.selectedTeam.set(null);
    this.teamSearchQuery.set('');
    this.showSuggestions.set(false);
  }

  protected clearAllFilters(): void {
    this.selectedRound.set('');
    this.selectedGroup.set('');
    this.selectedTeam.set(null);
    this.teamSearchQuery.set('');
    this.showSuggestions.set(false);
  }

  protected onTeamSearchBlur(): void {
    setTimeout(() => {
      this.showSuggestions.set(false);
    }, 200);
  }

  protected getGroupedScorers(fixture: Fixture, teamId: number): GroupedScorer[] {
    if (!fixture.events) return [];

    const goalEvents = fixture.events.filter(
      (e) => e.teamId === teamId && e.type.toLowerCase() === 'goal'
    );

    const parsedEvents = goalEvents.map((e) => {
      const sortMinute = e.minute + (e.extraMinute ? e.extraMinute / 100 : 0);
      const displayMinute = e.extraMinute ? `${e.minute}+${e.extraMinute}'` : `${e.minute}'`;
      return {
        playerName: e.playerName,
        sortMinute,
        displayMinute
      };
    });

    parsedEvents.sort((a, b) => a.sortMinute - b.sortMinute);

    const groups: { playerName: string; minutes: string[] }[] = [];
    for (const event of parsedEvents) {
      let group = groups.find((g) => g.playerName === event.playerName);
      if (!group) {
        group = { playerName: event.playerName, minutes: [] };
        groups.push(group);
      }
      group.minutes.push(event.displayMinute);
    }

    return groups.map((g) => ({
      playerName: g.playerName,
      minutes: g.minutes.join(', ')
    }));
  }

  protected hasShootout(fixture: Fixture): boolean {
    return (
      fixture.penaltiesHome !== null &&
      fixture.penaltiesAway !== null &&
      fixture.penaltiesHome !== undefined &&
      fixture.penaltiesAway !== undefined
    );
  }
}
