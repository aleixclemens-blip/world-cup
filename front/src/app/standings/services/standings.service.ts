import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_URL } from '../../core/api.config';
import { FLAG_MAP } from '../../core/flags.config';
import { ApiTeamStanding, TeamStanding, GroupStanding } from '../types/standings.types';

@Service()
export class StandingsService {
  private readonly http = inject(HttpClient);

  public getStandings(): Observable<GroupStanding[]> {
    return this.http.get<ApiTeamStanding[]>(`${API_URL}/standings`).pipe(
      map((apiData) => this.mapApiToGroupStandings(apiData))
    );
  }

  private mapApiToGroupStandings(apiData: ApiTeamStanding[]): GroupStanding[] {
    const groupsMap: Record<string, ApiTeamStanding[]> = {};

    // Group teams by their group property
    for (const team of apiData) {
      if (!groupsMap[team.group]) {
        groupsMap[team.group] = [];
      }
      groupsMap[team.group].push(team);
    }

    // Map each group to GroupStanding
    const groupStandings: GroupStanding[] = Object.keys(groupsMap).map((rawGroupName) => {
      const groupName = rawGroupName.replace(/^Group\s+/i, 'Grupo ');
      
      const apiTeams = groupsMap[rawGroupName];
      const teams: TeamStanding[] = apiTeams.map((item, index) => {
        const played = item.gamesWon + item.gamesDraw + item.gamesLost;
        const goalsDiff = item.goalsFor - item.goalsAgainst;

        return {
          ...item,
          rank: index + 1,
          flag: FLAG_MAP[item.teamName] || 'unknown',
          goalsDiff,
          played,
          group: groupName
        };
      });

      return {
        groupName,
        teams
      };
    });

    return groupStandings.sort((a, b) => a.groupName.localeCompare(b.groupName));
  }
}
