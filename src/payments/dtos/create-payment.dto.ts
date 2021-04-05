import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'common/dtos/output.dto';
import { Payment } from 'payments/entities/payments.entity';

@InputType()
export class CreatePaymentInput extends PickType(Payment, [
  'transactionId',
  'restaurantId',
]) {}

@ObjectType()
export class CreatePaymentOutput extends CoreOutput {}
