import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, ManyToMany } from "typeorm";
import { Group } from "./Group";
import { User } from "./User";

@Entity({ name: "TEAMS" })
export class Team {
  @PrimaryColumn({ name: "id", type: "int" })
  id!: number;

  @Column({ name: "name", type: "varchar", length: 150 })
  name!: string;

  @Column({ name: "founded", type: "int" })
  founded!: number;

  @Column({ name: "main_stadium", type: "varchar", length: 255 })
  mainStadium!: string;

  @Column({ name: "main_stadium_city", type: "varchar", length: 255 })
  mainStadiumCity!: string;

  @Column({ name: "group_id", type: "int", nullable: true })
  groupId?: number | null;

  @Column({ name: "world_cups_won", type: "int", default: 0 })
  worldCupsWon!: number;

  @Column({ name: "continent_cups_won", type: "int", default: 0 })
  continentCupsWon!: number;

  @Column({
    name: "continent_cup_name",
    type: "varchar",
    length: 150,
    default: "",
  })
  continentCupName!: string;

  @ManyToOne(() => Group, (group) => group.teams, {
    onDelete: "SET NULL",
    nullable: true,
  })
  @JoinColumn({ name: "group_id" })
  group?: Group | null;

  @ManyToMany(() => User, (user) => user.favoriteTeams)
  favoritedByUsers?: User[];
}
