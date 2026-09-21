import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import {
  OrganizationMembersRepository,
  OrganizationRepository,
  UserRepository,
} from '@myapp/database';
import { MailService } from '../mail/mail.service';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly orgRepo: OrganizationRepository,
    private readonly orgMemberRepo: OrganizationMembersRepository,
    private readonly userRepo: UserRepository,
    private readonly mailService: MailService,
  ) {}
  // create(createOrganizationDto: CreateOrganizationDto) {
  //   return 'This action adds a new organization';
  // }

  // findAll() {
  //   return `This action returns all organization`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} organization`;
  // }

  // update(id: number, updateOrganizationDto: UpdateOrganizationDto) {
  //   return `This action updates a #${id} organization`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} organization`;
  // }

  async inviteMember(orgId: string, email: string, currentUserId: string) {
    const org = await this.orgRepo.findOneById(orgId);
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const orgAdmin = await this.orgRepo.findIsAdmin(orgId, currentUserId);

    if (!orgAdmin) {
      throw new ForbiddenException(
        'Only organization admins can invite members',
      );
    }

    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new NotFoundException(
        'User must have an account before joining the organization',
      );
    }

    const existingMember = await this.orgMemberRepo.findUserByOrg(
      orgId,
      user.id,
    );
    if (existingMember) {
      throw new ConflictException(
        'User is already a member of this organization',
      );
    }

    const member = await this.orgMemberRepo.createOrgMember(orgId, user.id);

    await this.orgMemberRepo.save(member);
    await this.mailService.sendInvitationGreet(user.email, org.name);

    return {
      message: 'User added to organization successfully',
      memberId: member.id,
    };
  }

  async findAllMemberOfOrg(orgId: string, currentUserId: string){
    const org = await this.orgRepo.findOneById(orgId);
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    const isOwner = await this.orgRepo.findIsAdmin(orgId, currentUserId);
    if (!isOwner) {
      throw new ForbiddenException('Only organization owner can view members');
    }
    const members = await this.orgMemberRepo.findAllByOrgId(orgId);

    return {
      organizationId: orgId,
      members,
    };
  }
}
