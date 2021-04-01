import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'common/entities/core.entity';
import { Menu } from 'restaurants/entities/menu.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

/**
 * - `name` - 옵션 이름
 *
 * Example: [`Spicy`, `Size`] 등등
 *
 * - `choice` - 옵션 종류
 *
 * Example: [`매운맛`, `지옥맛`, `XL`, `M`] 등등
 */
@InputType('OrderItemOptionInputType', { isAbstract: true })
@ObjectType()
export class OrderItemOption {
  @Field(_type => String)
  name: string;

  @Field(_type => String, { nullable: true })
  choice?: string;
}

@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  @Field(_type => Menu)
  @ManyToOne(_type => Menu, { nullable: true, onDelete: 'CASCADE' })
  menu: Menu;

  @Field(_type => [OrderItemOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: OrderItemOption[];
}
