import { INestApplication } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export async function cleanDatabase(app: INestApplication): Promise<void> {
  const datasource = app.get<DataSource>(getDataSourceToken());
  const entities = datasource.entityMetadatas;

  for (const entity of entities) {
    const respository = datasource.getRepository(entity.name);
    await respository.query(`
                TRUNCATE TABLE "${entity.tableName}"
                RESTART IDENTITY CASCADE;
            `);
  }
}
