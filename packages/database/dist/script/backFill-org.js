"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const organization_entity_1 = require("../entities/organization.entity");
const organizationMember_entity_1 = require("../entities/organizationMember.entity");
const user_entity_1 = require("../entities/user.entity");
async function backFillorganizatiob(datasource) {
    const userMissingOrg = await datasource
        .createQueryBuilder(user_entity_1.User, 'user')
        .leftJoin(organization_entity_1.Organizations, 'org', 'org.owner_id = user.id AND org.is_default = true')
        .where('org.id IS NULL')
        .getMany();
    let successCount = 0;
    for (const user of userMissingOrg) {
        try {
            await datasource.transaction(async (manager) => {
                const org = manager.create(organization_entity_1.Organizations, {
                    owner: { id: user.id },
                    name: `${user.first_name}'s Organization`,
                    is_default: true,
                });
                await manager.save(org);
                const orgMember = manager.create(organizationMember_entity_1.OrganizationMembers, {
                    organization: { id: org.id },
                    user: { id: user.id },
                    joined_at: new Date(),
                });
                await manager.save(orgMember);
            });
            successCount++;
        }
        catch (error) {
            console.error(`Failed to backfill org for user ${user.id} (${user.email}):`, error.message);
        }
    }
    console.log(`Backfilled ${successCount} of ${userMissingOrg.length} users with default organizations`);
}
