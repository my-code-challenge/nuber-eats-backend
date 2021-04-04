import * as Joi from 'joi'; // validation config lib
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { Restaurant } from 'restaurants/entities/restaurants.entity';
import { UsersModule } from './users/users.module';
import { User } from 'users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { Verification } from 'users/entities/verification.entity';
import { MailModule } from './mail/mail.module';
import { Restaurant } from 'restaurants/entities/restaurants.entity';
import { Category } from 'restaurants/entities/category.entity';
import { RestaurantsModule } from 'restaurants/restaurants.module';
import { AuthModule } from 'auth/auth.module';
import { Menu } from 'restaurants/entities/menu.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from 'orders/entities/order.entity';
import { OrderItem } from 'orders/entities/order-item.entity';
import { CommonModule } from 'common/common.module';

/**
 * 동적모듈 (forRoot): 설정을 필요로하는 동적인 모듈
 * 정적모듈 : 어떠한 설정도 적용되어 있지않는 정적인 모듈
 * 의존성 주입: Dependency injection
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod', // 서버에 deploy 할 때 환경변수 파일을 사용하지 않습니다.
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod', 'test').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN_NAME: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required(),
      }),
    }),
    /** @description - https://docs.nestjs.com/techniques/database#typeorm-integration */
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !== 'prod',
      logging:
        process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'test',
      entities: [
        User,
        Verification,
        Restaurant,
        Category,
        Menu,
        Order,
        OrderItem,
      ],
    }),
    // forRoot: 동적모듈
    GraphQLModule.forRoot({
      installSubscriptionHandlers: true,
      autoSchemaFile: true, // == autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req, connection }) => {
        const TOKEN_KEY = 'x-jwt';
        // console.log(connection);
        // 웹소켓 통신 방식은 request가 존재하지 않음.
        return {
          token: req ? req.headers[TOKEN_KEY] : connection.context[TOKEN_KEY],
        };
      },
    }),
    JwtModule.forRoot({ privateKey: process.env.PRIVATE_KEY }), // 정적모듈
    MailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN_NAME,
      fromEmail: process.env.MAILGUN_FROM_EMAIL,
    }), // 정적모듈
    AuthModule,
    UsersModule,
    RestaurantsModule,
    OrdersModule,
    CommonModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer): void {
//     consumer.apply(JwtMiddleware).forRoutes({
//       // '/graphql' 경로에 'POST' 프로토콜 일때만 JwtMiddleware를 적용한다.
//       // path: '/graphql',
//       // method: RequestMethod.POST,
//       path: '*',
//       method: RequestMethod.POST,
//     });
//   }

//   // Function
//   // configure(consumer: MiddlewareConsumer): void {
//   //   consumer.apply(jwtMiddleware).forRoutes({
//   //     path: '*',
//   //     method: RequestMethod.ALL,
//   //   });
//   // }
// }
