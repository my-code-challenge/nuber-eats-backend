import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'users/entities/user.entity';
import { AllowedRoles } from './role.decorator';

/**
 * @description -  graphql context 오브젝트안에 'user'를 찾아서 존재 하면 true 존재하지 않으면 false 반환
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );

    if (!roles) {
      return true;
    }
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const { user }: { user?: User } = gqlContext['user'];

    if (!user) {
      return false;
    }
    if (roles.includes('Any')) {
      return true;
    }

    /**
     * @example
     * `['Delivery'].includes('Owner') => false`
     * `['Owner'].includes('Owner') => true`
     */
    return roles.includes(user.role);
  }
}
