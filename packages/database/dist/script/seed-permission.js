"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const data_source_1 = require("../config/data-source");
const permission_entity_1 = require("../entities/permission.entity");
const FIXED_PERMISSION = ['Bookmark.Read', 'Bookmark.Write', 'Bookmark.Delete'];
async function seedPermission(datasource) {
    const permissionRepo = datasource.getRepository(permission_entity_1.Permissions);
    let createdCount = 0;
    let skippedCount = 0;
    for (const name of FIXED_PERMISSION) {
        const existing = await permissionRepo.findOne({ where: { name } });
        if (existing) {
            console.log(`Skipping "${name}" — already exists`);
            skippedCount++;
            continue;
        }
        const permission = permissionRepo.create({ name });
        await permissionRepo.save(permission);
        console.log(`Created permission : ${name}`);
        createdCount++;
    }
    console.log(`Done — ${createdCount} created, ${skippedCount} already existed`);
}
async function run() {
    const datasource = new typeorm_1.DataSource(data_source_1.datasourceOptions);
    await datasource.initialize();
    try {
        await seedPermission(datasource);
    }
    catch (error) {
        console.error('Seed script failed:', error);
    }
    finally {
        await datasource.destroy();
    }
}
run();
