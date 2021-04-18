import { Field, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { CoreOutput } from 'common/dtos/output.dto';
import { Restaurant } from 'restaurants/entities/restaurants.entity';

@ObjectType()
export class MyRestaurantsOutput extends CoreOutput {
  @Field(_type => [Restaurant])
  @IsOptional()
  restaurants?: Restaurant[];
}
