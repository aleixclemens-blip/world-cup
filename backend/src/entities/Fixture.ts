import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Team } from "./Team";
import { Event } from "./Event";

@Entity({ name: "FIXTURES" })
export class Fixture {
  @PrimaryColumn({ name: "id", type: "int" })
  id!: number;

  @Column({ name: "referee", type: "varchar", length: 150 })
  referee!: string;

  @Column({ name: "stadium", type: "varchar", length: 255 })
  stadium!: string;

  @Column({ name: "stadium_city", type: "varchar", length: 255 })
  stadiumCity!: string;

  @Column({ name: "home_team_id", type: "int" })
  homeTeamId!: number;

  @Column({ name: "home_team_name", type: "varchar", length: 150 })
  homeTeamName!: string;

  @Column({ name: "away_team_id", type: "int" })
  awayTeamId!: number;

  @Column({ name: "away_team_name", type: "varchar", length: 150 })
  awayTeamName!: string;

  @Column({ name: "round", type: "varchar", length: 150 })
  round!: string;

  @Column({ name: "goals_home", type: "int", nullable: true })
  goalsHome?: number | null;

  @Column({ name: "goals_away", type: "int", nullable: true })
  goalsAway?: number | null;

  @Column({ name: "penalties_home", type: "int", nullable: true })
  penaltiesHome?: number | null;

  @Column({ name: "penalties_away", type: "int", nullable: true })
  penaltiesAway?: number | null;

  @ManyToOne(() => Team, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "home_team_id" })
  homeTeam?: Team;

  @ManyToOne(() => Team, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "away_team_id" })
  awayTeam?: Team;

  @OneToMany(() => Event, (event) => event.fixture)
  events?: Event[];
}
