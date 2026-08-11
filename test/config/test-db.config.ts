import * as dotenv from 'dotenv';
import { DataSourceOptions } from 'typeorm';
import { User } from '../../src_backup/users/entities/user.entity';

dotenv.config({ path: '.env.test' });

export const testDbConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User], 
  synchronize: true, 
  logging: ['error'],
};