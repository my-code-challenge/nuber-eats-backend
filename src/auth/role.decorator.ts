import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { UserRole } from 'users/entities/user.entity';

export type AllowedRoles = keyof typeof UserRole | 'Any';

export const Role = (roles: AllowedRoles[]): CustomDecorator<string> =>
  SetMetadata('roles', roles);
