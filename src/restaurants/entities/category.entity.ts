import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'common/entities/core.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Restaurant } from './restaurants.entity';

@InputType('CategoryInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Category extends CoreEntity {
  @Field(_type => String)
  @Column({ unique: true })
  @IsString()
  @Length(5)
  name: string;

  @Field(_type => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  coverImage: string;

  @Field(_type => String)
  @Column({ unique: true })
  @IsString()
  slug: string;

  @Field(_type => [Restaurant], { nullable: true })
  @OneToMany(_type => Restaurant, restaurant => restaurant.category)
  restaurant: Restaurant[];
}
