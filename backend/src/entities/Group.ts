import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Team } from './Team';

@Entity({ name: 'GROUPS' })
export class Group {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name!: string;

  @OneToMany(() => Team, (team) => team.group)
  teams?: Team[];
}
