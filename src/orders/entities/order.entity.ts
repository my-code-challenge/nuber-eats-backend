import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEnum, IsOptional } from 'class-validator';
import { CoreEntity } from 'common/entities/core.entity';
import { Menu } from 'restaurants/entities/menu.entity';
import { Restaurant } from 'restaurants/entities/restaurants.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { User } from 'users/entities/user.entity';

export enum OrderStatus {
  Pending = 'Pending', // 대기중
  Cooking = 'Cooking', // 요리중
  PickedUp = 'PickedUp', // 배달중
  Delivered = 'Delivered', // 배달완료
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
  })
  @IsOptional()
  customer?: User;

  @Field(_type => User, { nullable: true })
  @ManyToOne(_type => User, user => user.rides, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @IsOptional()
  driver?: User;

  @Field(_type => Restaurant, { nullable: true })
  @ManyToOne(_type => Restaurant, restaurant => restaurant.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @IsOptional()
  restaurant?: Restaurant;

  @Field(_type => [Menu])
  @ManyToMany(_type => Menu)
  @JoinTable() // JoinTable => 소유 하고 있는 쪽의 relation에 추가 (order는 메뉴를 어떤 고객이 주문 했는지 알 수 있기 때문)
  menus: Menu[];

  @Column()
  @Field(_type => Float)
  total: number;

  @Column({ type: 'enum', enum: OrderStatus })
  @Field(_type => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
