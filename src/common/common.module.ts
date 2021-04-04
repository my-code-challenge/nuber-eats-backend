import { Global, Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from './common.constant';

/**
 * 여러개의 서버를 가지는 플랫폼일 경우 다른 PubSub 라이브러리를 이용해야함
 * -> (여러 서버를 사용할때 subscription 라이브러리)[https://www.npmjs.com/package/graphql-redis-subscriptions]
 */
const pubsub = new PubSub();

@Global()
@Module({
  providers: [
    {
      provide: PUB_SUB,
      useValue: pubsub,
    },
  ],
  exports: [PUB_SUB],
})
export class CommonModule {}
