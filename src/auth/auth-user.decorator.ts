import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * @description - 로그인이 되어 있을경우에만 request 정보를 보내주기 위해 decorator 생성
 */
export const AuthUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const userContext = gqlContext['user'];
    console.log('gql getContext :', userContext);

    if (userContext.ok) {
      return userContext.user;
    } else {
      throw new Error();
    }
  },
);
