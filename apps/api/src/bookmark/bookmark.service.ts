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
  PLAN_CONFIG,
  UserPlanRepository,
  UserUsageRepository,
} from '@myapp/database';

@Injectable()
export class BookmarkService {
  constructor(
    private readonly bookmarkRepo: BookmarkRepository,
    private readonly userPlanRepo: UserPlanRepository,
    private readonly userUsageRepo: UserUsageRepository,
  ) {}

  async create(
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
    return;
  }

  async findAll(profileId: string) {
    return await this.bookmarkRepo.findAllBookmark(profileId);
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
}
