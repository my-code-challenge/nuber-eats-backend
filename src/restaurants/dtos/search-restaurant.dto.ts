import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { PaginationInput, PaginationOutput } from 'common/dtos/pagination.dto';
import { Restaurant } from 'restaurants/entities/restaurants.entity';

@InputType()
export class SearchRestaurantInput extends PaginationInput {
  @Field(_type => String)
  @IsString()
  query: string;
}

@ObjectType()
export class SearchRestaurantOutput extends PaginationOutput {
  @Field(_type => [Restaurant], { nullable: true })
  @IsOptional()
  restaurants?: Restaurant[];
}
