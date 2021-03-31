import { InputType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'common/dtos/output.dto';
import { User } from 'users/entities/user.entity';

@ObjectType()
export class EditProfileOutput extends CoreOutput {}

/**
 * @description [PartialType] 컬럼 속성들의 필수값을 선택값으로 변경
 */
@InputType()
export class EditProfileInput extends PickType(PartialType(User), [
  'email',
  'password',
]) {}
