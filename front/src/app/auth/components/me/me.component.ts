import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { TeamsService } from '../../../teams/services/teams.service';
import { Team } from '../../../teams/types/teams.types';

@Component({
  selector: 'app-me',
  imports: [RouterLink],
  templateUrl: './me.component.html'
})
export class MeComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly teamsService = inject(TeamsService);

  protected readonly favoriteTeams = signal<Team[]>([]);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);

  public ngOnInit(): void {
    this.loadFavorites();
  }

  protected async loadFavorites(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(this.teamsService.getFavoriteTeams());
      this.favoriteTeams.set(data);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      this.error.set('No se pudieron cargar tus selecciones favoritas.');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected async toggleFavorite(team: Team): Promise<void> {
    if (team.isFavoriteLoading) return;

    this.favoriteTeams.update((list) =>
      list.map((t) => (t.id === team.id ? { ...t, isFavoriteLoading: true } : t))
    );

    try {
      await firstValueFrom(this.teamsService.removeFavoriteTeam(team.id));
      this.favoriteTeams.update((list) => list.filter((t) => t.id !== team.id));
    } catch (err) {
      console.error('Error removing favorite:', err);
      this.favoriteTeams.update((list) =>
        list.map((t) => (t.id === team.id ? { ...t, isFavoriteLoading: false } : t))
      );
    }
  }
}
