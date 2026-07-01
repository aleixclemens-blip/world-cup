import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TeamsService } from './services/teams.service';
import { Team } from './types/teams.types';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-teams',
  imports: [],
  templateUrl: './teams.component.html'
})
export class TeamsComponent implements OnInit, OnDestroy {
  private readonly teamsService = inject(TeamsService);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly teams = signal<Team[]>([]);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);
  protected readonly searchQuery = signal<string>('');

  private readonly searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  public ngOnInit(): void {
    this.loadTeams();
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.loadTeams();
    });
  }

  public ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  protected async loadTeams(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const teamsData = await firstValueFrom(this.teamsService.getTeams(this.searchQuery()));
      
      let favoriteIds = new Set<number>();
      if (this.authService.isAuthenticated()) {
        try {
          const favoritesData = await firstValueFrom(this.teamsService.getFavoriteTeams());
          favoriteIds = new Set(favoritesData.map((t) => t.id));
        } catch (favErr) {
          console.error('Error fetching favorite teams:', favErr);
        }
      }

      const mergedTeams = teamsData.map((team) => ({
        ...team,
        isFavorite: favoriteIds.has(team.id),
        isFavoriteLoading: false
      }));

      this.teams.set(mergedTeams);
    } catch (err) {
      console.error('Error fetching teams:', err);
      this.error.set('No se pudieron cargar las selecciones. Por favor, inténtelo de nuevo.');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.searchSubject.next(value);
  }

  protected clearSearch(): void {
    this.searchQuery.set('');
    this.searchSubject.next('');
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
