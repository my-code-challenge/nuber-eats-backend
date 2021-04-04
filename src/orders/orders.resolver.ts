import { Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { AuthUser } from 'auth/auth-user.decorator';
import { Role } from 'auth/role.decorator';
import {
  NEW_COOKED_ORDER,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from 'common/common.constant';
import { PubSub } from 'graphql-subscriptions';
import { User } from 'users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';

@Resolver(_of => Order)
export class OrderResolver {
  constructor(
    private readonly orderService: OrderService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Mutation(_returns => CreateOrderOutput)
  @Role(['Client'])
  async createOrder(
    @AuthUser() customer: User,
    @Args('input') createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.orderService.createOrder(customer, createOrderInput);
  }

  @Query(_returns => GetOrdersOutput)
  @Role(['Any'])
  async getOrders(
    @AuthUser() user: User,
    @Args('input') getOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return this.orderService.getOrders(user, getOrdersInput);
  }

  @Query(_returns => GetOrderOutput)
  @Role(['Any'])
  async getOrder(
    @AuthUser() user: User,
    @Args('input') getOrderInput: GetOrderInput,
  ): Promise<GetOrderOutput> {
    return this.orderService.getOrder(user, getOrderInput);
  }

  @Mutation(_returns => EditOrderOutput)
  @Role(['Any'])
  async editOrder(
    @AuthUser() user: User,
    @Args('input') editOrderInput: EditOrderInput,
  ): Promise<EditOrderOutput> {
    return this.orderService.editOrder(user, editOrderInput);
  }

  @Subscription(_returns => Order, {
    /** @description Client가 주문 하면 해당 주문의 Restaurant.ownerId와 user의 id와 비교 */
    filter: (payload, _, context) => {
      const {
        pendingOrders: { ownerId },
      } = payload;
      const { user }: { user: User } = context;

      console.log(payload, ownerId, user.id);
      return ownerId === user.id;
    },
    resolve: payload => {
      const {
        pendingOrders: { order },
      } = payload;

      return order;
    },
  })
  @Role(['Owner'])
  pendingOrders(): AsyncIterator<void> {
    return this.pubSub.asyncIterator(NEW_PENDING_ORDER);
  }

  @Subscription(_returns => Order)
  @Role(['Delivery'])
  cookedOrders(): AsyncIterator<void> {
    return this.pubSub.asyncIterator(NEW_COOKED_ORDER);
  }

  /**
   * 소켓통신 테스트
   */
  // @Mutation(_returns => Boolean)
  // async startListeningTest(
  //   @Args('potatoId') potatoId: number,
  // ): Promise<Boolean> {
  //   await this.pubSub.publish('hotListening', {
  //     readyListeningTest: potatoId,
  //   });

  //   return true;
  // }

  // @Subscription(_returns => String, {
  //   filter: (payload, variables) => {
  //     const { readyListeningTest } = payload;
  //     const { potatoId } = variables;

  //     console.log(readyListeningTest, potatoId);

  //     return readyListeningTest === potatoId;
  //   },
  //   resolve: payload => {
  //     const { readyListeningTest } = payload;

  //     return `Your potato with the id ${readyListeningTest} is ready!`;
  //   },
  // })
  // @Role(['Any'])
  // readyListeningTest(
  //   @Args('potatoId') potatoId: number,
  // ): AsyncIterator<unknown> {
  //   return this.pubSub.asyncIterator('hotListening');
  // }
}
