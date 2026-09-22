import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import {
  BookmarkRepository,
  MemberRoleRepository,
  OrganizationMembersRepository,
  OrganizationRepository,
  PermissionRepository,
  PLAN_CONFIG,
  RolePermissionRepository,
  UserPlanRepository,
  UserUsageRepository,
} from '@myapp/database';
import { OrganizationService } from '../organization/organization.service';

@Injectable()
export class BookmarkService {
  constructor(
    private readonly bookmarkRepo: BookmarkRepository,
    private readonly userPlanRepo: UserPlanRepository,
    private readonly userUsageRepo: UserUsageRepository,
    private readonly orgMemberRepo: OrganizationMembersRepository,
    private readonly organizationService : OrganizationService,
  ) {}

  async createPersonalBookmark(
    profileId: string,
    createBookmarkDto: CreateBookmarkDto,
    userId: string,
  ) {
    const existBookmark = await this.bookmarkRepo.findByProfileAndArticle(
      profileId,
      createBookmarkDto.article_id,
    );
    const userPlan = await this.userPlanRepo.findByUserId(userId);

    if (!userPlan) {
      throw new NotFoundException('User plan not found');
    }

    const config = PLAN_CONFIG[userPlan.plan];
    if (config.bookmarkLimit !== null) {
      const userUsage = await this.userUsageRepo.findByUserId(userId);
      if (!userUsage) {
        throw new NotFoundException('User usage not found');
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const resetAt = userUsage.daily_bookmark_reset_at
        ? new Date(userUsage.daily_bookmark_reset_at)
        : null;

      const sameDay =
        resetAt !== null &&
        resetAt.getFullYear() === today.getFullYear() &&
        resetAt.getMonth() === today.getMonth() &&
        resetAt.getDate() === today.getDate();

      let currentCount: number;
      if (!sameDay) {
        await this.userUsageRepo.resetDailyBookmarkCount(userId, today);
        currentCount = 0;
      } else {
        currentCount = userUsage.daily_bookmark_count;
      }

      if (currentCount >= config.bookmarkLimit) {
        throw new ForbiddenException(
          `Bookmark limit reached (${config.bookmarkLimit}). Upgrade your plan to create more bookmarks.`,
        );
      }
    }
    if (existBookmark) {
      throw new ConflictException('Article already bookmarked');
    }

    const bookmark = this.bookmarkRepo.create({
      profile_id: profileId,
      article_id: createBookmarkDto.article_id,
      note: createBookmarkDto.note,
    });
    await this.bookmarkRepo.save(bookmark);

    const userPlanCheck = PLAN_CONFIG[userPlan.plan];
    if (userPlanCheck.bookmarkLimit !== null) {
      await this.userUsageRepo.increamentBookmarkCount(userId, 1);
    }
    return {bookmark};
  }

  async createOrgBookmark(
    profileId: string,
    createBookmarkDto: CreateBookmarkDto,
    userId: string,
    orgId: string
  ){

    const canWrite = await this.organizationService.hasPermission(orgId, userId, 'Bookmark.Write')
    console.log(canWrite)
    if(!canWrite){
      throw new ForbiddenException('You do not have permission to create bookmarks in this organization')
    }

    const isMember = await this.orgMemberRepo.isMember(userId, orgId)
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    const existOrgBookmark = await this.bookmarkRepo.findByOrgAndArticle(orgId, createBookmarkDto.article_id)
     if (existOrgBookmark) {
      throw new ConflictException('Article already bookmarked in this organization');
    }

    const orgBookmark = await this.bookmarkRepo.create({
      profile_id: profileId,
      article_id: createBookmarkDto.article_id,
      note: createBookmarkDto.note,
      organization_id: orgId
    });

    await this.bookmarkRepo.save(orgBookmark);
    return {orgBookmark};
  }

  async findAll(profileId: string) {
    return await this.bookmarkRepo.findAllBookmark(profileId);
  }

  async findAllByorg(orgId: string, userId: string){
     const isMember = await this.orgMemberRepo.isMember(userId, orgId)
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this organization');
    }
    
    return await this.bookmarkRepo.findAllBookmarkByOrg(orgId);
  }

  async findOne(id: string) {
    return await this.bookmarkRepo.findOneById(id);
  }

  async update(bookmarkId: string, profileId: string, note: string) {
    const bookmark = await this.bookmarkRepo.findOneById(bookmarkId);
    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    Object.assign(bookmark, note);
    return this.bookmarkRepo.save(bookmark);
  }

  async remove(bookmarkId: string) {
    const bookmark = await this.bookmarkRepo.findOneById(bookmarkId);
    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    await this.bookmarkRepo.remove(bookmark);
    return { message: 'Bookmark removed successfull' };
  }

  async checkedBookmark(profileId: string, articleId: string) {
    const bookmark = await this.bookmarkRepo.findByProfileAndArticle(
      profileId,
      articleId,
    );
    return {
      isBookmarked: !!bookmark,
      bookmark_id: bookmark?.id ?? null,
    };
  }

  async deleteBookmark(bookmarkId: string, userId: string, profileId: string) {
    const bookmark = await this.bookmarkRepo.findOneById(bookmarkId)
    if(!bookmark){
      throw new NotFoundException('Bookmark not found');
    }

    if(bookmark.organization_id){
      const canDelete = await this.organizationService.hasPermission(bookmark.organization_id, userId, 'Bookmark.Delete')
      if(!canDelete){
        throw new ForbiddenException('You do not have permission to delete bookmarks in this organization');
      }      
    }else{
       if (bookmark.profile_id !== profileId) {
      throw new ForbiddenException('You can only delete your own bookmarks');
    }
    }

    await this.bookmarkRepo.delete(bookmarkId);
    return {message : "Bookmark successfully deleted"}
  }
}
