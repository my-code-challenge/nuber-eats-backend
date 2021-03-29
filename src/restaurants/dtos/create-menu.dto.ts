import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { IsInt } from 'class-validator';
import { CoreOutput } from 'common/dtos/output.dto';
import { Menu } from 'restaurants/entities/menu.entity';

@InputType()
export class CreateMenuInput extends PickType(Menu, [
  'name',
  'price',
  'description',
  'options',
]) {
  @Field(_type => Int)
  @IsInt()
  restaurantId: number;
}

@ObjectType()
export class CreateMenuOutput extends CoreOutput {}
