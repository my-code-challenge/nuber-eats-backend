import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { PaginationInput, PaginationOutput } from 'common/dtos/pagination.dto';
import { Category } from 'restaurants/entities/category.entity';

@InputType()
export class CategoryInput extends PaginationInput {
  @Field(_type => String)
  slug: string;
}

@ObjectType()
export class CategoryOutput extends PaginationOutput {
  @Field(_type => Category, { nullable: true })
  category?: Category;
}
