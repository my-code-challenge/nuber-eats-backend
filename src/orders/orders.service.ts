import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu, MenuOption } from 'restaurants/entities/menu.entity';
import { Restaurant } from 'restaurants/entities/restaurants.entity';
import { Repository } from 'typeorm';
import { User, UserRole } from 'users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Menu)
    private readonly menus: Repository<Menu>,
  ) {}

  async createOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurants.findOne({ id: restaurantId });

      if (!restaurant) {
        return {
          ok: false,
          error: '음식점을 찾을 수 없습니다',
        };
      }

      let orderTotalPrice = 0;
      const orderItems: OrderItem[] = [];
      for (const item of items) {
        // orderItems의 options === items의 options랑 타입이 같음

        const menu = await this.menus.findOne({ id: item.menuId });
        if (!menu) {
          return {
            ok: false,
            error: '메뉴를 찾을 수 없습니다',
          };
        }

        // console.log(`menu price: ${menu.price}원`);
        let menuTotalPrice = menu.price;
        for (const itemOption of item.options) {
          // console.log('0:', itemOption);

          const menuOption: MenuOption = menu.options.find(
            menuOption => menuOption.name === itemOption.name,
          );

          if (menuOption) {
            if (menuOption.extra) {
              // console.log(`1: +${menuOption.extra}원`);
              menuTotalPrice += menuOption.extra;
            } else {
              const menuOptionChoice = menuOption.choices.find(
                optionChoice => optionChoice.name === itemOption.choice,
              );

              if (menuOptionChoice) {
                if (menuOptionChoice.extra) {
                  // console.log(`2: +${menuOptionChoice.extra}원`);
                  menuTotalPrice += menuOptionChoice.extra;
                }
              }
            }
          }
        }
        orderTotalPrice += menuTotalPrice;
        // console.log(orderTotalPrice);

        const orderItem = await this.orderItems.save(
          this.orderItems.create({ menu, options: item.options }),
        );
        orderItems.push(orderItem);
      }

      await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderTotalPrice,
          items: orderItems,
        }),
      );

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: '주문 생성에 실패 했습니다',
      };
    }
  }

  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      let orders: Order[] = [];
      if (user.role === UserRole.Client) {
        orders = await this.orders.find({
          where: {
            customer: user,
            ...(status && { status }), // status가 존재하면 {status: status} status가 undefined면 {}
          },
        });
      } else if (user.role === UserRole.Delivery) {
        orders = await this.orders.find({
          where: {
            driver: user,
            ...(status && { status }),
          },
        });
      } else if (user.role === UserRole.Owner) {
        const restaurants = await this.restaurants.find({
          where: {
            owner: user,
          },
          relations: ['orders'],
        });

        // - `flat(1)` - Example: [[[1]], [2], 3, 4, 5].flat(1) => [[1],2,3,4,5]
        orders = restaurants.map(restaurant => restaurant.orders).flat();

        if (status) {
          orders = orders.filter(order => order.status === status);
        }
      }

      return {
        ok: true,
        orders,
      };
    } catch {
      return {
        ok: false,
        error: '주문목록을 가져 오는데 실패했습니다',
      };
    }
  }

  async getOrder(
    user: User,
    { id: orderId }: GetOrderInput,
  ): Promise<GetOrderOutput> {
    try {
      const order = await this.orders.findOne(
        {
          id: orderId,
        },
        { relations: ['customer', 'driver', 'restaurant'] },
      );
      if (!order) {
        return {
          ok: false,
          error: '주문내역을 찾을 수 없습니다',
        };
      }

      let canSee = true;
      if (user.role === UserRole.Client && order.customerId !== user.id) {
        canSee = false;
      }

      if (user.role === UserRole.Delivery && order.driverId !== user.id) {
        canSee = false;
      }

      if (
        user.role === UserRole.Owner &&
        order.restaurant.ownerId !== user.id
      ) {
        canSee = false;
      }

      return {
        ok: canSee,
        error: !canSee && '주문내역 보기 권한이 없습니다',
        ...(canSee && { order }),
      };
    } catch {
      return {
        ok: false,
        error: '주문내역을 가져 오는데 실패했습니다',
      };
    }
  }
}
