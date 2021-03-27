import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsInt, IsOptional } from 'class-validator';
import { CoreOutput } from './output.dto';

@InputType()
export class PaginationInput {
  @Field(_type => Int, { defaultValue: 1 })
  @IsInt()
  page: number;
}

@ObjectType()
export class PaginationOutput extends CoreOutput {
  @Field(_type => Int, { nullable: true })
  @IsOptional()
  totalPages?: number;
}
