import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { CoreOutput } from 'common/dtos/output.dto';
import { Order, OrderStatus } from 'orders/entities/order.entity';

@InputType()
export class GetOrdersInput {
  @Field(_type => OrderStatus, { nullable: true })
  @IsOptional()
  status?: OrderStatus;
}

@ObjectType()
export class GetOrdersOutput extends CoreOutput {
  @Field(_type => [Order], { nullable: true })
  @IsOptional()
  orders?: Order[];
}
