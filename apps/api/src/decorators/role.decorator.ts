import { UserRole } from "@myapp/database";
import { Reflector } from "@nestjs/core";

export const Roles = Reflector.createDecorator<UserRole[]>();