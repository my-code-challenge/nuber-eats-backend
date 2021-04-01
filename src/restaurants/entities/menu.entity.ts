import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsInt, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { CoreEntity } from 'common/entities/core.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Restaurant } from './restaurants.entity';

@InputType('MenuChoiceInputType', { isAbstract: true })
@ObjectType()
export class MenuChoice {
  @Field(_type => String)
  @IsString()
  name: string;

  @Field(_type => Int, { nullable: true })
  @IsInt()
  extra?: number;
}

@InputType('MenuOptionInputType', { isAbstract: true })
@ObjectType()
export class MenuOption {
  @Field(_type => String)
  name: string;

  @Field(_type => [MenuChoice], { nullable: true })
  @IsOptional()
  choices?: MenuChoice[];

  @Field(_type => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  extra?: number;
}

@InputType('MenuInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Menu extends CoreEntity {
  @Field(_type => String)
  @Column({ unique: true })
  @IsString()
  @Length(5)
  name: string;

  @Field(_type => Int)
  @Column()
  @IsNumber()
  price: number;

  @Field(_type => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  photo: string;

  @Field(_type => String)
  @Column()
  @IsString()
  @Length(5, 140)
  description: string;

  @Field(_type => Restaurant)
  @ManyToOne(_type => Restaurant, restaurant => restaurant.menu, {
    onDelete: 'CASCADE',
  })
  restaurant: Restaurant;

  @RelationId((menu: Menu) => menu.restaurant)
  @IsNumber()
  restaurantId: number;

  @Field(_type => [MenuOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  @IsOptional()
  options?: MenuOption[];
}
