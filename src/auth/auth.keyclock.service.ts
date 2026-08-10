import { HttpService } from '@nestjs/axios';
import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login-user.dto';
import { firstValueFrom } from 'rxjs';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { KeyclockAdminService } from './keyclock.admin.service';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { decode } from 'jsonwebtoken';

const KEYCLOAK_URL = process.env.KEYCLOAK_URL;
const REALM = process.env.REALM;
const CLIENT_ID = process.env.CLIENT_ID as string;
const CLIENT_SECRET = process.env.CLIENT_SECRET as string;

@Injectable()
export class AuthKeyclockService {
  constructor(
    private readonly httpService: HttpService,
    private keyclockAdminService: KeyclockAdminService,
    private userService : UsersService
  ) {}

//   async login(dto: LoginDto) {
//     try {
//       const response = await firstValueFrom(
//         this.httpService.post(
//           `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
//           new URLSearchParams({
//             client_id: CLIENT_ID,
//             client_secret: CLIENT_SECRET,
//             grant_type: 'password',
//             username: dto.email,
//             password: dto.password,
//           }),
//           { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
//         ),
//       );
//       return response.data;
//     } catch (error) {
//       throw new UnauthorizedException(
//         'Invalid credentials',
//         error instanceof Error ? error.message : 'Unknown Errro',
//       );
//     }
//   }

//   async signup(dto: CreateUserDto) {
//     const keyclockUserId =
//       await this.keyclockAdminService.createKeyclockUser(dto);

//     try {
//       const existEmail = await this.userService.findEmailWithPassword(
//         dto.email,
//       );
//       if (existEmail) {
//         throw new ConflictException('User with this email already exist');
//       }

//       const saltRound = 10;
//       const password = await bcrypt.hash(dto.password, saltRound);

//     //   const otp = crypto.randomInt(100000, 999999).toString();
//     //   const hashedOtp = await bcrypt.hash(otp, 10);
//     //   const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

//       const newUser = await this.userService.create({
//         ...dto,
//          password,
//         // isEmailVerified: false,
//         // emailVerificationOtp: hashedOtp,
//         // emailVerificationExpires: otpExpires,
//       });

//     //   await this.mailService.sendVerificationOtpEmail(newUser.email, otp);
//     //   await this.signUpCountService.incrSignUpCount();
//       return {
//         message: 'Register successfull! Verify email to check you email',
//       };
//     } catch (error) {
//         await this.keyclockAdminService.deleteKeyclockUser(keyclockUserId)
//         throw new InternalServerErrorException('Signup failed, please try again');
//     }
//   }

  async exchangeCodeForTokens(code: string) {
  const response = await firstValueFrom(
    this.httpService.post(
      `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'http://localhost:3100/auth/callback', 
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    ),
  );
  return response.data;
}

async syncLocalUser(accessToken: string) {
    const payload : any= decode(accessToken)
     if (!payload) throw new UnauthorizedException('Invalid token');

     const keycloakId = payload.sub as string;
     const user = await this.userService.findByKeycloakId(keycloakId);

     if(!user){
        await this.userService.create({
            keycloakId,
            email: payload.email,
            password: 'MANAGED_BY_KEYCLOAK',
            firstName : payload.given_name,
            lastName: payload.family_name,
        })
     }
     return user;
}   
}
