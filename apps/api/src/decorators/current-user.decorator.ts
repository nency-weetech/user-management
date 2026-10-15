import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const currentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{ user?: any }>();
    return request.user;
  },
);
