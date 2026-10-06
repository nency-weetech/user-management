import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import { buffer, Observable } from 'rxjs';

@Injectable()
export class ServiceKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const given = Buffer.from(String(req.headers['x-service-key'] ?? ''));
    const expected = Buffer.from(process.env.PDF_SERVICE_KEY ?? '');

    const ok =
      expected.length > 0 &&
      given.length === expected.length &&
      timingSafeEqual(given, expected);

    if (!ok) throw new UnauthorizedException();
    return true;
  }
}
