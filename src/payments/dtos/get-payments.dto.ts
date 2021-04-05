import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'common/dtos/output.dto';
import { Payment } from 'payments/entities/payments.entity';

@ObjectType()
export class GetPaymentsOutput extends CoreOutput {
  @Field(_type => [Payment], { nullable: true })
  payments?: Payment[];
}
