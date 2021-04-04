import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'users/entities/user.entity';

/**
 * @description - 로그인이 되어 있을경우에만 request 정보를 보내주기 위해 decorator 생성
 */
export const AuthUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user: User = gqlContext['user'];
    console.log('gql getContext :', gqlContext['user']);

    return user;
  },
);
