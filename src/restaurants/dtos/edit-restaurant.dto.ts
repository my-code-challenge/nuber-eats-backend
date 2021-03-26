import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { CoreOutput } from 'common/dtos/output.dto';
import { CreateRestaurantInput } from './create-restaurant.dto';

/**
 * @description [PartialType] 컬럼 속성들의 필수값을 선택값으로 변경
 */
@InputType()
export class EditRestaurantInput extends PartialType(CreateRestaurantInput) {
  @Field(_type => Number)
  restaurantId: number;
}

@ObjectType()
export class EditRestaurantOutput extends CoreOutput {}
