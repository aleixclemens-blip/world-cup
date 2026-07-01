export interface ApiTeamGroup {
  id: number;
  name: string;
}

export interface ApiTeam {
  id: number;
  name: string;
  founded: number;
  mainStadium: string;
  mainStadiumCity: string;
  groupId: number;
  worldCupsWon: number;
  continentCupsWon: number;
  continentCupName: string;
  group: ApiTeamGroup;
}

export interface Team extends ApiTeam {
  flag: string;
  isFavorite?: boolean;
  isFavoriteLoading?: boolean;
}
