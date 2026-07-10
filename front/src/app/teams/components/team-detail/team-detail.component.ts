import { Component, signal, inject, computed, linkedSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of, forkJoin, firstValueFrom } from 'rxjs';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';
import { TeamsService } from '../../services/teams.service';
import { ResultsService } from '../../../results/services/results.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Team } from '../../types/teams.types';
import { Fixture } from '../../../results/types/results.types';

export interface GroupedScorer {
  playerName: string;
  minutes: string;
}

@Component({
  selector: 'app-team-detail',
  imports: [],
  templateUrl: './team-detail.component.html'
})
export class TeamDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly teamsService = inject(TeamsService);
  private readonly resultsService = inject(ResultsService);
  protected readonly authService = inject(AuthService);

  // States
  protected readonly isLoading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);
  protected readonly isFavoriteLoading = signal<boolean>(false);

  // Derive route param 'id' as a signal
  private readonly teamId = toSignal(
    this.route.paramMap.pipe(
      map((params) => Number(params.get('id')))
    )
  );

  protected readonly retryTrigger = signal<number>(0);

  // Combine teamId and retryTrigger into a single computed signal
  private readonly queryTrigger = computed(() => ({
    id: this.teamId(),
    retry: this.retryTrigger()
  }));

  // Reactively fetch team and fixtures whenever queryTrigger changes
  private readonly dataState = toSignal(
    toObservable(this.queryTrigger).pipe(
      map((trigger) => trigger.id),
      filter((id): id is number => id !== undefined && id !== null && !isNaN(id)),
      tap(() => {
        this.isLoading.set(true);
        this.error.set(null);
      }),
      switchMap((id) =>
        forkJoin({
          team: this.teamsService.getTeamById(id),
          favorites: this.authService.isAuthenticated()
            ? this.teamsService.getFavoriteTeams().pipe(catchError(() => of([])))
            : of([]),
          fixtures: this.resultsService.getFixtures({ teamId: id }).pipe(catchError(() => of([])))
        }).pipe(
          map(({ team, favorites, fixtures }) => {
            if (!team) {
              throw new Error('Team not found');
            }
            const isFavorite = favorites.some((t) => t.id === id);
            return {
              team: { ...team, isFavorite },
              fixtures
            };
          }),
          catchError((err) => {
            console.error('Error loading team details:', err);
            this.error.set('No se pudo cargar la información de la selección. Inténtelo de nuevo.');
            return of(null);
          })
        )
      ),
      tap(() => this.isLoading.set(false))
    )
  );

  // Use linkedSignal for team to keep it reset with routing changes, yet writable locally for toggleFavorite
  protected readonly team = linkedSignal<Team | null>(() => this.dataState()?.team ?? null);

  // Derive fixtures computed from dataState
  protected readonly fixtures = computed<Fixture[]>(() => this.dataState()?.fixtures ?? []);

  protected goBack(): void {
    this.location.back();
  }

  protected async toggleFavorite(): Promise<void> {
    const currentTeam = this.team();
    if (!currentTeam) return;

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.isFavoriteLoading()) return;
    this.isFavoriteLoading.set(true);

    try {
      if (currentTeam.isFavorite) {
        await firstValueFrom(this.teamsService.removeFavoriteTeam(currentTeam.id));
        this.team.set({ ...currentTeam, isFavorite: false });
      } else {
        await firstValueFrom(this.teamsService.addFavoriteTeam(currentTeam.id));
        this.team.set({ ...currentTeam, isFavorite: true });
      }
    } catch (err) {
      console.error('Error updating favorite status on details page:', err);
    } finally {
      this.isFavoriteLoading.set(false);
    }
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
