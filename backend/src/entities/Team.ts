import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Group } from './Group';

@Entity({ name: 'TEAMS' })
export class Team {
  @PrimaryColumn({ name: 'id', type: 'int' })
  id!: number;

  @Column({ name: 'name', type: 'varchar', length: 150 })
  name!: string;

  @Column({ name: 'founded', type: 'int' })
  founded!: number;

  @Column({ name: 'main_stadium', type: 'varchar', length: 255 })
  mainStadium!: string;

  @Column({ name: 'main_stadium_city', type: 'varchar', length: 255 })
  mainStadiumCity!: string;

  @Column({ name: 'group_id', type: 'int', nullable: true })
  groupId?: number | null;

  @ManyToOne(() => Group, (group) => group.teams, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'group_id' })
  group?: Group | null;
}
