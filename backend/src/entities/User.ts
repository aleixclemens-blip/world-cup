import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity({ name: 'USERS' })
export class User {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Index({ unique: true })
  @Column({ name: 'email', type: 'varchar', length: 150 })
  email!: string;

  @Column({ name: 'password', type: 'varchar', length: 255 })
  password!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}
