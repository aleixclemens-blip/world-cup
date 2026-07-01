import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Fixture } from "./Fixture";
import { Team } from "./Team";

@Entity({ name: "EVENTS" })
export class Event {
  @PrimaryGeneratedColumn({ name: "id", type: "int" })
  id!: number;

  @Column({ name: "fixture_id", type: "int" })
  fixtureId!: number;

  @Column({ name: "type", type: "varchar", length: 50 })
  type!: string;

  @Column({ name: "minute", type: "int" })
  minute!: number;

  @Column({ name: "extra_minute", type: "int", nullable: true })
  extraMinute?: number | null;

  @Column({ name: "player_name", type: "varchar", length: 150 })
  playerName!: string;

  @Column({ name: "team_id", type: "int" })
  teamId!: number;

  @Column({ name: "team_name", type: "varchar", length: 150 })
  teamName!: string;

  @ManyToOne(() => Fixture, (fixture) => fixture.events, { onDelete: "CASCADE" })
  @JoinColumn({ name: "fixture_id" })
  fixture?: Fixture;

  @ManyToOne(() => Team, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "team_id" })
  team?: Team;
}
