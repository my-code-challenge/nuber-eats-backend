import {
  Field,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { CoreEntity } from 'common/entities/core.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Restaurant } from './restaurants.entity';

export enum Size {
  XL = 'XL',
  L = 'L',
  M = 'M',
  S = 'S',
}

registerEnumType(Size, { name: 'Size' });

@InputType('MenuOptionInputType', { isAbstract: true })
@ObjectType()
class MenuOption {
  @Field(_type => String)
  name: string;

  @Field(_type => [String], { nullable: true })
  @IsOptional()
  choices?: string[];

  @Column({ type: 'enum', enum: Size, nullable: true })
  @Field(_type => Size)
  @IsEnum(Size)
  @IsOptional()
  size?: Size;

  @Field(_type => Int)
  extra: number;
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
