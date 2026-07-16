import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_URL } from '../../core/api.config';
import { FLAG_MAP } from '../../core/flags.config';
import { ApiTeam, Team } from '../types/teams.types';

@Service()
export class TeamsService {
  private readonly http = inject(HttpClient);

  public getTeams(name?: string, orderBy?: string, orderDir?: string): Observable<Team[]> {
    const params: Record<string, string> = {};
    if (name) params['name'] = name;
    if (orderBy) params['orderBy'] = orderBy;
    if (orderDir) params['orderDir'] = orderDir;

    return this.http.get<ApiTeam[]>(`${API_URL}/teams`, { params }).pipe(
      map((apiTeams) =>
        apiTeams.map((team) => ({
          ...team,
          flag: FLAG_MAP[team.name] || 'unknown'
        }))
      )
    );
  }

  public getTeamById(id: number): Observable<Team | undefined> {
    return this.getTeams().pipe(
      map((teams) => teams.find((t) => t.id === id))
    );
  }

  public getFavoriteTeams(): Observable<Team[]> {
    return this.http.get<ApiTeam[]>(`${API_URL}/teams/favorites`).pipe(
      map((apiTeams) =>
        apiTeams.map((team) => ({
          ...team,
          flag: FLAG_MAP[team.name] || 'unknown'
        }))
      )
    );
  }

  public addFavoriteTeam(teamId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API_URL}/teams/favorites`, { teamId });
  }

  public removeFavoriteTeam(teamId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_URL}/teams/favorites`, {
      body: { teamId }
    });
  }
}
