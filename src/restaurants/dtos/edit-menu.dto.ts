import {
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { IsInt } from 'class-validator';
import { CoreOutput } from 'common/dtos/output.dto';
import { Menu } from 'restaurants/entities/menu.entity';

@InputType()
export class EditMenuInput extends PickType(PartialType(Menu), [
  'name',
  'options',
  'price',
  'description',
]) {
  @Field(_type => Int)
  @IsInt()
  menuId: number;
}

@ObjectType()
export class EditMenuOutput extends CoreOutput {}
