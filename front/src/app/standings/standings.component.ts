import { Component, signal } from '@angular/core';

export interface TeamStanding {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
    flag: string;
  };
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
}

export interface GroupStanding {
  groupName: string;
  teams: TeamStanding[];
}

interface BaseTeamStanding {
  rank: number;
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  team: {
    id: number;
    name: string;
    logo: string;
  };
}

const FLAG_MAP: Record<string, string> = {
  'Netherlands': '🇳🇱',
  'Senegal': '🇸🇳',
  'Ecuador': '🇪🇨',
  'Qatar': '🇶🇦'
};

const BASE_GROUP_DATA: BaseTeamStanding[] = [
  {
    "rank": 1,
    "team": {
      "id": 1118,
      "name": "Netherlands",
      "logo": "https://media.api-sports.io/football/teams/1118.png"
    },
    "points": 7,
    "goalsDiff": 4,
    "group": "Group A",
    "form": "WDW",
    "all": {
      "played": 3,
      "win": 2,
      "draw": 1,
      "lose": 0,
      "goals": {
        "for": 5,
        "against": 1
      }
    }
  },
  {
    "rank": 2,
    "team": {
      "id": 13,
      "name": "Senegal",
      "logo": "https://media.api-sports.io/football/teams/13.png"
    },
    "points": 6,
    "goalsDiff": 1,
    "group": "Group A",
    "form": "WWL",
    "all": {
      "played": 3,
      "win": 2,
      "draw": 0,
      "lose": 1,
      "goals": {
        "for": 5,
        "against": 4
      }
    }
  },
  {
    "rank": 3,
    "team": {
      "id": 2382,
      "name": "Ecuador",
      "logo": "https://media.api-sports.io/football/teams/2382.png"
    },
    "points": 4,
    "goalsDiff": 1,
    "group": "Group A",
    "form": "LDW",
    "all": {
      "played": 3,
      "win": 1,
      "draw": 1,
      "lose": 1,
      "goals": {
        "for": 4,
        "against": 3
      }
    }
  },
  {
    "rank": 4,
    "team": {
      "id": 1569,
      "name": "Qatar",
      "logo": "https://media.api-sports.io/football/teams/1569.png"
    },
    "points": 0,
    "goalsDiff": -6,
    "group": "Group A",
    "form": "LLL",
    "all": {
      "played": 3,
      "win": 0,
      "draw": 0,
      "lose": 3,
      "goals": {
        "for": 1,
        "against": 7
      }
    }
  }
];

@Component({
  selector: 'app-standings',
  imports: [],
  templateUrl: './standings.component.html'
})
export class StandingsComponent {
  protected readonly groups = signal<GroupStanding[]>(
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((letter) => {
      const teams: TeamStanding[] = BASE_GROUP_DATA.map((t) => ({
        ...t,
        group: `Grupo ${letter}`,
        team: {
          ...t.team,
          flag: FLAG_MAP[t.team.name] || '🏳️'
        }
      }));
      return {
        groupName: `Grupo ${letter}`,
        teams
      };
    })
  );
}
