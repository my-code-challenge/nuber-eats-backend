import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'common/entities/core.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { User } from 'users/entities/user.entity';
import { Category } from './category.entity';

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  @Field(_type => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field(_type => String)
  @Column()
  @IsString()
  coverImage: string;

  @Field(_type => String)
  @Column()
  address: string;

  @Field(_type => Category, { nullable: true })
  @ManyToOne(_type => Category, category => category.restaurant, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category: Category;

  @Field(_type => User)
  @ManyToOne(_type => User, user => user.restaurants, { onDelete: 'CASCADE' })
  owner: User;

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;
}
