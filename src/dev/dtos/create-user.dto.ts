import { ArgsType, Field, Int } from '@nestjs/graphql';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

// data transfet object(DTO)
@ArgsType()
export class CreateUserDto {
  @Field(() => Int)
  @IsInt()
  id: number;

  @Field(() => String)
  @IsString()
  @Length(2, 10)
  name: string;

  @Field(() => String)
  @IsString()
  email: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  gender?: 'male' | 'female';

  @Field(() => String)
  @IsString()
  address: string;

  @Field(() => Boolean)
  @IsBoolean()
  isVIP: boolean;
}
