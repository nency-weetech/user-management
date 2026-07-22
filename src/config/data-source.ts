
import { DataSourceOptions } from 'typeorm';
import { DataSource } from 'typeorm/browser';

export const datasourceOptions : DataSourceOptions = {
    type: 'postgres',
    host : process.env.DB_HOST,
    port : process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    username : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
    entities : [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations : [__dirname + '/../database/migrations/*{.ts,.js}' ],
    synchronize : process.env.NODE_ENV === 'devlopment',
    logging : process.env.NODE_ENV === 'devlopment' ? ['query', 'error'] : ['error'], 
}

const datasource = new DataSource(datasourceOptions);
export default datasource;