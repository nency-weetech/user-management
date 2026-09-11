import { UserRepository } from '@myapp/database';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsGuard implements CanActivate {
  private readonly logger = new Logger(WsGuard.name);

 constructor(private jwtService : JwtService, private userRepository : UserRepository) {}
  async canActivate(context: ExecutionContext) {
    const client: Socket = context.switchToWs().getClient();
    const token = client.handshake.auth?.token;

    if (!token) {
      this.logger.warn(`No token: ${client.id}`);
      client.emit('auth_error', { message: 'No token provided' })
      return false;
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      if (!client.data.userId) {
        const user = await this.userRepository.findOne({
          where: { id: payload.id },
        });
        client.data.userId = payload.id;
        client.data.firstName = user?.firstName ?? 'Unknown';
      }
      return true;
    } catch(error) {
       if (error instanceof TokenExpiredError) {
        this.logger.warn(`Token expired: ${client.id}`);
        client.emit('token_expired', { message: 'Access token expired' });
      } else {
        this.logger.warn(`Invalid token: ${client.id}`);
        client.emit('auth_error', { message: 'Invalid token' });
      }
      return false;
    }
  }
}