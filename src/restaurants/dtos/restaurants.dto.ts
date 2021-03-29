import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { PaginationInput, PaginationOutput } from 'common/dtos/pagination.dto';
import { Restaurant } from 'restaurants/entities/restaurants.entity';

@InputType()
export class RestaurantsInput extends PaginationInput {}

@ObjectType()
export class RestaurantsOutput extends PaginationOutput {
  @Field(_type => [Restaurant], { nullable: true })
  @IsOptional()
  restaurants?: Restaurant[];
}
