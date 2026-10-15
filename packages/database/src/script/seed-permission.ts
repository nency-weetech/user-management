import { DataSource } from 'typeorm';
import { datasourceOptions } from '../config/data-source';
import { Permissions } from '../entities/permission.entity';

const FIXED_PERMISSION = ['Bookmark.Read', 'Bookmark.Write', 'Bookmark.Delete'];

async function seedPermission(datasource: DataSource) {
  const permissionRepo = datasource.getRepository(Permissions);

  let createdCount = 0;
  let skippedCount = 0;

  for (const name of FIXED_PERMISSION) {
    const existing = await permissionRepo.findOne({ where: { name } });

    if (existing) {
      console.log(`Skipping "${name}" — already exists`);
      skippedCount++;
      continue;
    }

    const permission = permissionRepo.create({name})
    await permissionRepo.save(permission);

    console.log(`Created permission : ${name}`)
    createdCount++;
  }

  console.log(`Done — ${createdCount} created, ${skippedCount} already existed`);
}

async function run(){
    const datasource = new DataSource(datasourceOptions);
    await datasource.initialize()

    try {
        await seedPermission(datasource);
    } catch (error) {
        console.error('Seed script failed:', error);
    } finally {
        await datasource.destroy();
    }
}

run()