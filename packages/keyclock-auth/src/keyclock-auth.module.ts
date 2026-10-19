import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { KeycloakService } from './keyclock.service';
import { KeycloakJwtStrategy } from './keyclock-jwt.strategy';
import { KeycloakAuthGuard, KeycloakRolesGuard } from './guards';

@Module({
  imports: [PassportModule],
  providers: [KeycloakService, KeycloakJwtStrategy, KeycloakAuthGuard, KeycloakRolesGuard],
  exports: [KeycloakService, KeycloakAuthGuard, KeycloakRolesGuard],
})
export class KeycloakAuthModule {}