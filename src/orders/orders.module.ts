import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from 'restaurants/entities/menu.entity';
import { Restaurant } from 'restaurants/entities/restaurants.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrderResolver } from './orders.resolver';
import { OrderService } from './orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Restaurant, Menu])],
  providers: [OrderResolver, OrderService],
})
export class OrdersModule {}
