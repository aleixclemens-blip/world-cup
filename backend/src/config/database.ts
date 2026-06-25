import { DataSource } from 'typeorm';
import { config } from './index';
import { Group } from '../entities/Group';
import { Team } from '../entities/Team';
import { Standing } from '../entities/Standing';
import { Fixture } from '../entities/Fixture';
import { User } from '../entities/User';
import { RefreshToken } from '../entities/RefreshToken';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: config.MYSQL_HOST,
  port: 3306,
  username: config.MYSQL_USERNAME,
  password: config.MYSQL_PASSWORD,
  database: config.MYSQL_DB,
  synchronize: false,
  logging: config.NODE_ENV === 'development',
  entities: [Group, Team, Standing, Fixture, User, RefreshToken],
  migrations: [__dirname + '/../migrations/*.ts', __dirname + '/../migrations/*.js'],
  subscribers: [],
});
