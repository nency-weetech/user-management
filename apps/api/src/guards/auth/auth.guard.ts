import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService : JwtService) {}

  async canActivate(context: ExecutionContext) {

    const request = context.switchToHttp().getRequest();

    let token = request.cookies;

    if(!token){
      throw new UnauthorizedException('Please login to access this resouces.')
    }

    if(typeof token === 'object' && token !== null){
      token = token.accessToken || Object.values(token)[0]
    }

    if(typeof token !== 'string') {
      throw new UnauthorizedException('Invalid token');
    }

    try {
      const decoded = await this.jwtService.verifyAsync(token as string);
      request.user = {id: decoded.id, email: decoded.email, role: decoded.role};
      
      return true;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid or expired token, please try again')
    }
  }
}
