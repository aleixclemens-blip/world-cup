import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Team } from "./Team";

@Entity({ name: "USERS" })
export class User {
  @PrimaryGeneratedColumn({ name: "id" })
  id!: number;

  @Index({ unique: true })
  @Column({ name: "email", type: "varchar", length: 150 })
  email!: string;

  @Column({ name: "password", type: "varchar", length: 255 })
  password!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @ManyToMany(() => Team, (team) => team.favoritedByUsers)
  @JoinTable({
    name: "USER_FAVORITE_TEAMS",
    joinColumn: { name: "user_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "team_id", referencedColumnName: "id" },
  })
  favoriteTeams!: Team[];
}
