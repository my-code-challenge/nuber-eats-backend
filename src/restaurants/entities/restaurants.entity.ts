import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'common/entities/core.entity';
import { Order } from 'orders/entities/order.entity';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { User } from 'users/entities/user.entity';
import { Category } from './category.entity';
import { Menu } from './menu.entity';

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  @Field(_type => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field(_type => String)
  @Column()
  @IsString()
  coverImage: string;

  @Field(_type => String)
  @Column()
  address: string;

  @Field(_type => Category, { nullable: true })
  @ManyToOne(_type => Category, category => category.restaurants, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: true,
  })
  category: Category;

  @Field(_type => User)
  @ManyToOne(_type => User, user => user.restaurants, { onDelete: 'CASCADE' })
  owner: User;

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  @Field(_type => [Menu])
  @OneToMany(_type => Menu, menu => menu.restaurant)
  menu: Menu[];

  @Field(_type => [Order])
  @OneToMany(_type => Order, order => order.restaurant)
  orders: Order[];

  /** [1] payment field */
  @Field(_type => Boolean)
  @Column({ default: false })
  isPromoted: boolean;

  /** [2] payment field */
  @Field(_type => Date, { nullable: true })
  @Column({ nullable: true })
  promotedUntil?: Date;
}
