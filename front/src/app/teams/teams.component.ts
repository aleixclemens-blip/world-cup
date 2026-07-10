import { Component, signal, inject, computed, linkedSignal } from '@angular/core';
import { Router } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of, forkJoin, firstValueFrom } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { TeamsService } from './services/teams.service';
import { Team } from './types/teams.types';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-teams',
  imports: [],
  templateUrl: './teams.component.html'
})
export class TeamsComponent {
  private readonly teamsService = inject(TeamsService);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isLoading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);
  protected readonly searchQuery = signal<string>('');
  protected readonly retryTrigger = signal<number>(0);

  // Combine searchQuery and retryTrigger
  private readonly queryTrigger = computed(() => ({
    query: this.searchQuery(),
    retry: this.retryTrigger()
  }));

  // Loaded teams stream triggered automatically when queryTrigger changes
  private readonly loadedTeams = toSignal(
    toObservable(this.queryTrigger).pipe(
      debounceTime(300),
      distinctUntilChanged((a, b) => a.query === b.query && a.retry === b.retry),
      tap(() => {
        this.isLoading.set(true);
        this.error.set(null);
      }),
      switchMap((trigger) =>
        forkJoin({
          teamsData: this.teamsService.getTeams(trigger.query),
          favoritesData: this.authService.isAuthenticated()
            ? this.teamsService.getFavoriteTeams().pipe(catchError(() => of([])))
            : of([])
        }).pipe(
          map(({ teamsData, favoritesData }) => {
            const favoriteIds = new Set(favoritesData.map((t) => t.id));
            return teamsData.map((team) => ({
              ...team,
              isFavorite: favoriteIds.has(team.id),
              isFavoriteLoading: false
            }));
          }),
          catchError((err) => {
            console.error('Error fetching teams:', err);
            this.error.set('No se pudieron cargar las selecciones. Por favor, inténtelo de nuevo.');
            return of([]);
          })
        )
      ),
      tap(() => this.isLoading.set(false))
    ),
    { initialValue: [] }
  );

  // Writable linked signal initialized with loadedTeams to allow local favorite updates
  protected readonly teams = linkedSignal<Team[]>(() => this.loadedTeams());

  protected onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  protected clearSearch(): void {
    this.searchQuery.set('');
  }

  protected viewTeamDetail(teamId: number): void {
    this.router.navigate(['/teams', teamId]);
  }

  protected async toggleFavorite(team: Team): Promise<void> {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    if (team.isFavoriteLoading) return;

    this.teams.update((list) =>
      list.map((t) => (t.id === team.id ? { ...t, isFavoriteLoading: true } : t))
    );

    try {
      if (team.isFavorite) {
        await firstValueFrom(this.teamsService.removeFavoriteTeam(team.id));
        this.teams.update((list) =>
          list.map((t) => (t.id === team.id ? { ...t, isFavorite: false, isFavoriteLoading: false } : t))
        );
      } else {
        await firstValueFrom(this.teamsService.addFavoriteTeam(team.id));
        this.teams.update((list) =>
          list.map((t) => (t.id === team.id ? { ...t, isFavorite: true, isFavoriteLoading: false } : t))
        );
      }
    } catch (err) {
      console.error('Error updating favorite status:', err);
      this.teams.update((list) =>
        list.map((t) => (t.id === team.id ? { ...t, isFavoriteLoading: false } : t))
      );
    }
  }
}
