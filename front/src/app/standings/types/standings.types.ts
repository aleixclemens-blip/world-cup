export interface ApiTeamStanding {
  group: string;
  teamId: number;
  teamName: string;
  gamesWon: number;
  gamesDraw: number;
  gamesLost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface TeamStanding extends ApiTeamStanding {
  rank: number;
  flag: string;
  goalsDiff: number;
  played: number;
}

export interface GroupStanding {
  groupName: string;
  teams: TeamStanding[];
}
