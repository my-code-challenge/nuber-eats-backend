import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from 'jwt/jwt.service';
import { UserService } from 'users/users.service';
import { AllowedRoles } from './role.decorator';

/**
 * @description -  graphql context 오브젝트안에 'user'를 찾아서 존재 하면 true 존재하지 않으면 false 반환
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );
    if (!roles) {
      return true;
    }
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const token = gqlContext.token;
    if (token) {
      const decoded = this.jwtService.verify(token.toString());
      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        const { user } = await this.userService.findById(decoded['id']);
        if (user) {
          gqlContext['user'] = user;
          if (roles.includes('Any')) {
            return true;
          }

          if (roles.includes(user.role)) {
            return true;
          } else {
            throw new UnauthorizedException(`${roles}만 접근 가능 합니다`);
          }
        }
      }
    }
    throw new UnauthorizedException('Token이 존재 하지 않습니다');
  }
}
