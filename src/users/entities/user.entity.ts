import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { IsBoolean, IsEmail, IsEnum, IsString } from 'class-validator';
import { CoreEntity } from 'common/entities/core.entity';
import { Restaurant } from 'restaurants/entities/restaurants.entity';

export enum UserRole {
  Client = 'Client',
  Owner = 'Owner',
  Delivery = 'Delivery',
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column({ unique: true })
  @Field(() => String)
  @IsEmail()
  email: string;

  @Column({ select: false }) // 프로필수정(editProfile)에서 이메일만 변경 할때에도 password의 hash가 변경 되는 현상을 막기 위해 select: false 설정
  @Field(() => String)
  @IsString()
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field(_type => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ default: false })
  @Field(_type => Boolean)
  @IsBoolean()
  verified: boolean;

  @Field(_type => [Restaurant])
  @OneToMany(_type => Restaurant, restaurant => restaurant.owner)
  restaurants: Restaurant[];

  // create hash password
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    try {
      console.log({ before: this.password });

      if (this.password) {
        console.log('start');
        this.password = await bcrypt.hash(this.password, 10);
      }

      console.log({ after: this.password });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      console.log('login 2', {
        password: aPassword,
        comparePassword: this.password,
      });
      const ok = await bcrypt.compare(aPassword, this.password);
      return ok;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }
}
