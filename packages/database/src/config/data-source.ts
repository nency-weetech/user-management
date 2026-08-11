import "dotenv/config"
import path from 'path';
import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

// dotenv.config({ path: path.resolve(process.cwd(), '../../packages/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
console.log(path.join((process.cwd(), '../../.env')))
console.log(process.env.DB_PASSWORD)
export const datasourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD ,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'], 
  //entities: [User, Article],
  migrations : [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false,
    //process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test',
  logging:
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
      ? ['error']
      : ['error'],
};

const datasource = new DataSource(datasourceOptions);

export default datasource;
