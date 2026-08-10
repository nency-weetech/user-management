import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

const KEYCLOAK_URL = process.env.KEYCLOAK_URL;
const REALM = process.env.REALM;
const CLIENT_ID = process.env.CLIENT_ID as string;
const CLIENT_SECRET = process.env.CLIENT_SECRET as string;

@Injectable()
export class KeyclockAdminService {
  private cachedToken: string | null = null;
  private tokenExpiresAt = 0;

  constructor(private readonly httpService: HttpService) {}

  async getAdminToken(): Promise<string> {
    const now = Date.now();
    if (this.cachedToken && now < this.tokenExpiresAt) {
      return this.cachedToken;
    }

    const response = await firstValueFrom(
      this.httpService.post(
        `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
        new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: 'client_credentials',
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      ),
    );
    this.cachedToken = response.data.access_token;
    this.tokenExpiresAt = now + (response.data.expires_in - 10) * 1000;

    return this.cachedToken as string;
  }

  async createKeyclockUser(dto: CreateUserDto): Promise<string> {
    const token = await this.getAdminToken();

    const createResponse = await firstValueFrom(
      this.httpService.post(
        `${KEYCLOAK_URL}/admin/realms/${REALM}/users`,
        {
          username: dto.email,
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          enabled: true,
          emailVerified: true,
          credentials: [
            {
              type: 'password',
              value: dto.password,
              temporary: false,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    const location: string = createResponse.headers['location'];
    const keyclockUserId = location.split('/').pop() as string;
    return keyclockUserId;
  }

  async deleteKeyclockUser(keyclockUserId: string): Promise<void> {
    const token = await this.getAdminToken();
    await firstValueFrom(
      this.httpService.delete(
        `${KEYCLOAK_URL}/admin/realms/${REALM}/users/${keyclockUserId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      ),
    );
  }

  //   async login(dto: LoginDto) {
  //     try {
  //      const response = await firstValueFrom(
  //         this.httpService.post(
  //           `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
  //           new URLSearchParams({
  //             client_id: CLIENT_ID,
  //             client_secret: CLIENT_SECRET,
  //             grant_type: 'password',
  //             username : dto.email,
  //             password : dto.password,
  //           }),
  //           { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  //         ),
  //     );
  //     return response.data;
  //     } catch (error) {
  //         throw new UnauthorizedException('Invalid credentials', error instanceof Error ? error.message : 'Unknown Errro');
  //     }
  //   }
}
