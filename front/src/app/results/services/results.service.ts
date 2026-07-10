import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_URL } from '../../core/api.config';
import { FLAG_MAP } from '../../core/flags.config';
import { ApiFixture, Fixture, Comment } from '../types/results.types';

@Service()
export class ResultsService {
  private readonly http = inject(HttpClient);

  public getFixtures(filters?: { round?: string; group?: string; teamId?: number }): Observable<Fixture[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.round) {
        params = params.set('round', filters.round);
      }
      if (filters.group) {
        params = params.set('group', filters.group);
      }
      if (filters.teamId !== undefined && filters.teamId !== null) {
        params = params.set('teamId', filters.teamId.toString());
      }
    }

    return this.http.get<ApiFixture[]>(`${API_URL}/fixtures`, { params }).pipe(
      map((apiFixtures) =>
        apiFixtures.map((fixture) => ({
          ...fixture,
          homeTeamFlag: FLAG_MAP[fixture.homeTeamName] || 'unknown',
          awayTeamFlag: FLAG_MAP[fixture.awayTeamName] || 'unknown',
        }))
      )
    );
  }

  public getFixtureById(id: number): Observable<Fixture> {
    return this.http.get<ApiFixture>(`${API_URL}/fixtures/${id}`).pipe(
      map((fixture) => ({
        ...fixture,
        homeTeamFlag: FLAG_MAP[fixture.homeTeamName] || 'unknown',
        awayTeamFlag: FLAG_MAP[fixture.awayTeamName] || 'unknown',
      }))
    );
  }

  public getComments(fixtureId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${API_URL}/fixtures/${fixtureId}/comments`);
  }

  public createComment(fixtureId: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(`${API_URL}/fixtures/${fixtureId}/comments`, { content });
  }

  public deleteComment(fixtureId: number, commentId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_URL}/fixtures/${fixtureId}/comments/${commentId}`);
  }
}
