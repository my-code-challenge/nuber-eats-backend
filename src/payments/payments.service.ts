import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'restaurants/entities/restaurants.entity';
import { LessThan, Repository } from 'typeorm';
import { User } from 'users/entities/user.entity';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dtos/create-payment.dto';
import { GetPaymentsOutput } from './dtos/get-payments.dto';
import { Payment } from './entities/payments.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
  ) {}

  async createPayment(
    owner: User,
    { transactionId, restaurantId }: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    try {
      const restaurant = await this.restaurants.findOne({ id: restaurantId });
      if (!restaurant) {
        return {
          ok: false,
          error: '음식점을 찾을 수 없습니다 🥲',
        };
      }

      if (restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: '이용 할 수 없습니다',
        };
      }

      await this.payments.save(
        this.payments.create({
          transactionId,
          user: owner,
          restaurant,
        }),
      );

      restaurant.isPromoted = true;
      const date = new Date();
      date.setDate(date.getDate() + 7); // 현재일 기준 +7일
      restaurant.promotedUntil = date;

      await this.restaurants.save(restaurant);

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: '결제 생성중 오류가 발생했습니다',
      };
    }
  }

  async getPayments(owner: User): Promise<GetPaymentsOutput> {
    try {
      const payments = await this.payments.find({ user: owner });
      return {
        ok: true,
        payments,
      };
    } catch {
      return {
        ok: false,
        error: '결제를 가져오던중 오류가 발생했습니다',
      };
    }
  }

  @Interval(2000)
  async checkPromotedRestaurants(): Promise<void> {
    const restaurants = await this.restaurants.find({
      isPromoted: true,
      promotedUntil: LessThan(new Date()),
    });

    restaurants.forEach(async restaurant => {
      restaurant.isPromoted = false;
      restaurant.promotedUntil = null;

      await this.restaurants.save(restaurant);
    });
  }
}
