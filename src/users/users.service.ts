import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { JwtService } from 'jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { MailService } from 'mail/mail.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {
    // this.jwtService.hello();
  }

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    // check new user
    try {
      const exists = await this.users.findOne({ email });

      if (exists) {
        // make error
        return {
          ok: false,
          error: '해당 이메일을 가진 사용자가 이미 존재합니다',
        };
        // return [false, '해당 이메일을 가진 사용자가 이미 존재합니다'];
      }

      // create user & hash the password
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );

      // create email verification
      const verification = await this.verifications.save(
        this.verifications.create({ user }),
      );

      await this.mailService.sendVerificationEmail(
        user.email,
        verification.code,
      );

      return {
        ok: true,
      };
      // return [true];
    } catch (err) {
      // make error
      // console.log(err);
      return {
        ok: false,
        error: '계정을 생성할 수 없음',
      };
      // return [false, '계정을 생성할 수 없음'];
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      // find the user with email
      const user = await this.users.findOne(
        { email },
        { select: ['id', 'password'] },
      );

      // console.log('user', user);

      if (!user) {
        return {
          ok: false,
          error: '유저를 찾을 수 없습니다',
        };
      }

      // check if the password is correct
      const passwordCorrect = await user.checkPassword(password);

      if (!passwordCorrect) {
        return {
          ok: false,
          error: '잘못된 비밀번호 입니다',
        };
      } else {
        // make a JWT and give it to the user
        const token = this.jwtService.sign(user.id);
        return {
          ok: true,
          token,
        };
      }
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({ id });

      return { ok: true, user };
    } catch (error) {
      return {
        ok: false,
        error: '유저를 찾을 수 없습니다',
      };
    }
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    // .update는 DB에 쿼리만 보내서 BeforeUpdate가 실행 되지 않아서 패스워드 수정을 해도 hash로 변경 되지 않는다.
    // 그래서 update 대신에 save를 사용
    // return this.users.update({ id: userId }, { ...editProfileInput });

    try {
      const user = await this.users.findOne({ id: userId });

      if (email) {
        // console.log(userId, email);
        user.email = email;
        user.verified = false;
        await this.verifications.delete({ user: { id: user.id } });
        const verification = await this.verifications.save(
          this.verifications.create({ user }),
        );

        this.mailService.sendVerificationEmail(user.email, verification.code);
      }

      if (password) {
        user.password = password;
      }

      await this.users.save(user);

      return {
        ok: true,
      };
    } catch (error) {
      return { ok: false, error: '프로필 수정이 불가능 합니다' };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verifications.findOne(
        { code },
        { relations: ['user'] },
      );

      if (verification) {
        // console.log(verification.user);
        verification.user.verified = true;
        await this.users.save(verification.user);

        // 유효성이 성공적으로 완료 되면 기존 유효성 데이터 삭제
        await this.verifications.delete(verification.id);

        return {
          ok: true,
        };
      }

      throw new Error();
    } catch (error) {
      return {
        ok: false,
        error: '유효성(Verification)을 찾을 수 없습니다',
      };
    }
  }
}
