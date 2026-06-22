import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Team } from './Team';

@Entity({ name: 'STANDINGS' })
@Index(['group'])
export class Standing {
  @PrimaryColumn({ name: 'group', type: 'varchar', length: 50 })
  group!: string;

  @PrimaryColumn({ name: 'team_id', type: 'int' })
  teamId!: number;

  @Column({ name: 'team_name', type: 'varchar', length: 150 })
  teamName!: string;

  @Column({ name: 'games_won', type: 'int', default: 0 })
  gamesWon!: number;

  @Column({ name: 'games_draw', type: 'int', default: 0 })
  gamesDraw!: number;

  @Column({ name: 'games_lost', type: 'int', default: 0 })
  gamesLost!: number;

  @Column({ name: 'goals_for', type: 'int', default: 0 })
  goalsFor!: number;

  @Column({ name: 'goals_against', type: 'int', default: 0 })
  goalsAgainst!: number;

  @Column({ name: 'points', type: 'int', default: 0 })
  points!: number;

  @ManyToOne(() => Team, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team?: Team;
}
