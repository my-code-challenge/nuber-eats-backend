import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { CoreOutput } from 'common/dtos/output.dto';
import { User } from 'users/entities/user.entity';

@ArgsType()
export class UserProfileInput {
  @Field(_type => Number)
  userId: number;
}

@ObjectType()
export class UserProfileOutput extends CoreOutput {
  @Field(_type => User, { nullable: true })
  @IsOptional()
  user?: User;
}
