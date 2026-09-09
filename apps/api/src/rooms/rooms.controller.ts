import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dtos/create-room-dto';
import { AuthGuard } from '../guards/auth/auth.guard';
import { currentUser } from '../decorators/current-user.decorator';

@Controller('rooms')
@UseGuards(AuthGuard)
export class RoomsController {
  constructor(private roomService: RoomsService) {}

  @Post('create')
  async createRoom(
    @Body() dto: CreateRoomDto,
    @currentUser() currentUser: { id: string },
    @Req() req: any,
  ) {
    const ownerId = currentUser.id;
    return this.roomService.createRoom(dto, ownerId);
  }

  @Get('my-rooms')
  async getMyRooms(@currentUser() currentUser: { id: string }) {
    return this.roomService.getMyRooms(currentUser.id);
  }

  @Get('discover')
  async discoverRooms(@currentUser() user: { id: string }) {
    return this.roomService.getDiscoverableRooms(user.id);
  }

  @Get(':id')
  async getRoomById(@Param('id') id: string) {
    return this.roomService.getRoomById(id);
  }

  @Post(':id/join-request')
  async requestToJoin(
    @Param('id') roomId: string,
    @currentUser() currentUser: { id: string },
  ) {
    return this.roomService.requestToJoin(currentUser.id, roomId);
  }

  @Get(':id/pending-request')
  async getPendingRequest(
    @Param('id') roomId: string,
    @currentUser() currentUser: { id: string },
  ) {
    return this.roomService.getPendingRequest(currentUser.id, roomId);
  }

  @Post(':id/join-request/:requestId/approve-request')
  async approveRequest(
    @currentUser() currentUser: { id: string },
    @Param('requestId') requestId: string,
  ) {
    await this.roomService.approveRequest(currentUser.id, requestId);
    return { message: 'Request Approved' };
  }

  @Post(':id/join-request/:requestId/reject-request')
  async rejectRequest(
    @currentUser() currentUser: { id: string },
    @Param('requestId') requestId: string,
  ) {
    await this.roomService.rejectRequest(currentUser.id, requestId);
    return { message: 'Request Rejected' };
  }
}
