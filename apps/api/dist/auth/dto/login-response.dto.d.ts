import { UserResponseDto } from './user-response.dto';
export declare class LoginResponseDto {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    user: UserResponseDto;
}
