import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { CoreEntity } from 'common/entities/core.entity';
import { Restaurant } from 'restaurants/entities/restaurants.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  RelationId,
} from 'typeorm';
import { User } from 'users/entities/user.entity';
import { OrderItem } from './order-item.entity';

/**
 * - `Pending` - 대기중
 * - `Cooking` - 요리중
 * - `Cooked` - 요리완료
 * - `PickedUp` - 배달중
 * - `Delivered` - 배달완료
 */
export enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  Cooked = 'Cooked',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}

registerEnumType(OrderStatus, { name: 'OrderStatus', description: '주문상태' });

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @Field(_type => User, { nullable: true })
  @ManyToOne(_type => User, user => user.orders, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  @IsOptional()
  customer?: User;

  @RelationId((order: Order) => order.customer)
  customerId: number;

  @Field(_type => User, { nullable: true })
  @ManyToOne(_type => User, user => user.rides, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  @IsOptional()
  driver?: User;

  @RelationId((order: Order) => order.driver)
  driverId: number;

  @Field(_type => Restaurant, { nullable: true })
  @ManyToOne(_type => Restaurant, restaurant => restaurant.orders, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  @IsOptional()
  restaurant?: Restaurant;

  @Field(_type => [OrderItem])
  @ManyToMany(_type => OrderItem, { eager: true })
  @JoinTable()
  items: OrderItem[];

  @Column({ nullable: true })
  @Field(_type => Float, { nullable: true })
  @IsNumber()
  total?: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending })
  @Field(_type => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
