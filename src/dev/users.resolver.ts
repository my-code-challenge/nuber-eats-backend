import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './entities/users.entity';

@Resolver(() => User)
export class UserResolver {
  @Query(() => Boolean)
  users(@Args('bool') bool: boolean): boolean {
    return bool;
  }

  @Mutation(() => Boolean)
  createUser(@Args() createUserDto: CreateUserDto): boolean {
    console.log(createUserDto);
    return true;
  }
}
