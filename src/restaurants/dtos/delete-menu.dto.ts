import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'common/dtos/output.dto';

@InputType()
export class DeleteMenuInput {
  @Field(_type => Int)
  menuId: number;
}

@ObjectType()
export class DeleteMenuOutput extends CoreOutput {}
