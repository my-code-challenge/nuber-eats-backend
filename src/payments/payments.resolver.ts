import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'auth/auth-user.decorator';
import { Role } from 'auth/role.decorator';
import { User } from 'users/entities/user.entity';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dtos/create-payment.dto';
import { GetPaymentsOutput } from './dtos/get-payments.dto';
import { Payment } from './entities/payments.entity';
import { PaymentService } from './payments.service';

@Resolver(_of => Payment)
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @Mutation(_returns => CreatePaymentOutput)
  @Role(['Owner'])
  createPayment(
    @AuthUser() owner: User,
    @Args('input') createPaymentInput: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    return this.paymentService.createPayment(owner, createPaymentInput);
  }

  @Query(_returns => GetPaymentsOutput)
  @Role(['Owner'])
  getPayments(@AuthUser() owner: User): Promise<GetPaymentsOutput> {
    return this.paymentService.getPayments(owner);
  }
}
