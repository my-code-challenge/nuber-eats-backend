import { Field, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { CoreOutput } from 'common/dtos/output.dto';
import { Category } from 'restaurants/entities/category.entity';

@ObjectType()
export class AllCategoriesOutput extends CoreOutput {
  @Field(_type => [Category], { nullable: true })
  @IsOptional()
  categories?: Category[];
}
