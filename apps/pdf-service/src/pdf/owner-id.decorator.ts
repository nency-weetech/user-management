import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { isUUID } from 'class-validator';

export const OwnerId = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const id = ctx.switchToHttp().getRequest().headers['x-owner-id'];
  if (typeof id !== 'string' || !isUUID(id)) {
    throw new BadRequestException('x-owner-id must be a UUID');
  }
  return id;
});