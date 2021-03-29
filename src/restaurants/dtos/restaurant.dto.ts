import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsInt, IsOptional } from 'class-validator';
import { CoreOutput } from 'common/dtos/output.dto';
import { Restaurant } from 'restaurants/entities/restaurants.entity';

@InputType()
export class RestaurantInput {
  @Field(_type => Int)
  @IsInt()
  restaurantId: number;
}

@ObjectType()
export class RestaurantOutput extends CoreOutput {
  @Field(_type => Restaurant, { nullable: true })
  @IsOptional()
  restaurant?: Restaurant;
}
