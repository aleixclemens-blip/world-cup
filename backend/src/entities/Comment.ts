import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Fixture } from "./Fixture";

@Entity({ name: "COMMENTS" })
export class Comment {
  @PrimaryGeneratedColumn({ name: "id" })
  id!: number;

  @Column({ name: "content", type: "varchar", length: 1000 })
  content!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @Column({ name: "user_id", type: "int" })
  userId!: number;

  @Column({ name: "fixture_id", type: "int" })
  fixtureId!: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Fixture, { onDelete: "CASCADE" })
  @JoinColumn({ name: "fixture_id" })
  fixture!: Fixture;
}
