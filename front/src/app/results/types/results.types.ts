export interface FixtureEvent {
  id: number;
  fixtureId: number;
  type: string; // e.g. "Goal"
  minute: number;
  extraMinute: number | null;
  playerName: string;
  teamId: number;
  teamName: string;
}

export interface FixtureTeamGroup {
  id: number;
  name: string;
}

export interface FixtureTeam {
  id: number;
  name: string;
  group: FixtureTeamGroup;
}

export interface ApiFixture {
  id: number;
  referee: string | null;
  stadium: string | null;
  stadiumCity: string | null;
  homeTeamId: number;
  homeTeamName: string;
  awayTeamId: number;
  awayTeamName: string;
  round: string;
  goalsHome: number | null;
  goalsAway: number | null;
  penaltiesHome: number | null;
  penaltiesAway: number | null;
  homeTeam: FixtureTeam;
  awayTeam: FixtureTeam;
  events: FixtureEvent[];
}

export interface Fixture extends ApiFixture {
  homeTeamFlag: string;
  awayTeamFlag: string;
}

export interface CommentUser {
  id: number;
  username: string;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  userId: number;
  fixtureId: number;
  user: CommentUser;
}

