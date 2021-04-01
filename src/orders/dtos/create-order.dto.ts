import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { CoreOutput } from 'common/dtos/output.dto';
import { OrderItemOption } from 'orders/entities/order-item.entity';

@InputType()
class CreateOrderItemInput {
  @Field(_type => Int)
  menuId: number;

  @Field(_type => [OrderItemOption], { nullable: true })
  @IsOptional()
  options?: OrderItemOption[];
}

@InputType()
export class CreateOrderInput {
  @Field(_type => Int)
  restaurantId: number;

  @Field(_type => [CreateOrderItemInput])
  items: CreateOrderItemInput[];
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {}
