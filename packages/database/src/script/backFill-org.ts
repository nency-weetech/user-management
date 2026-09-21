import { DataSource } from "typeorm";
import { Organizations } from "../entities/organization.entity";
import { OrganizationMembers } from "../entities/organizationMember.entity";
import { User } from "../entities/user.entity";

async function backFillorganizatiob(datasource: DataSource) {
  const userMissingOrg = await datasource
    .createQueryBuilder(User, 'user')
    .leftJoin(
      Organizations,
      'org',
      'org.owner_id = user.id AND org.is_default = true',
    )
    .where('org.id IS NULL')
    .getMany();

  let successCount = 0;

  for (const user of userMissingOrg) {
    try {
      await datasource.transaction(async (manager) => {
        const org = manager.create(Organizations, {
          owner: { id: user.id } as User,
          name: `${user.first_name}'s Organization`,
          is_default: true,
        });
        await manager.save(org);

        const orgMember = manager.create(OrganizationMembers, {
          organization: { id: org.id } as Organizations,
          user: { id: user.id } as User,
          joined_at: new Date(),
        });
        await manager.save(orgMember);
      });
      successCount++;
    } catch (error) {
      console.error(
        `Failed to backfill org for user ${user.id} (${user.email}):`,
        error.message,
      );
    }
  }

  console.log(`Backfilled ${successCount} of ${userMissingOrg.length} users with default organizations`);
}