import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'common/dtos/output.dto';

@InputType()
export class DeleteRestaurantInput {
  @Field(_type => Number)
  restaurantId: number;
}

@ObjectType()
export class DeleteRestaurantOutput extends CoreOutput {}
