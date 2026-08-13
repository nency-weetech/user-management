import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Observable } from 'rxjs';
import { Roles } from '../../decorators/role.decorator';


@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflactor: Reflector) {}

  canActivate(context: ExecutionContext) {
    const role = this.reflactor.get(Roles, context.getHandler());

    if (!role) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      throw new ForbiddenException('Access denied: User role not resolved');
    }

    const hasRole = role.includes(user.role);

    if(!hasRole){
      throw new ForbiddenException('Access denied : Insufficiant permission')
    }

    return hasRole;
  }
}
