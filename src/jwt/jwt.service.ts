import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'common/common.constant';
import * as jwt from 'jsonwebtoken';
import { JwtModuleOptions } from './jwt.interfaces';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
  ) {}

  /**
   * 회원 ID를 가지고 토큰 생성
   * @param userId - 회원 ID
   */
  sign(userId: number): string {
    return jwt.sign({ id: userId }, this.options.privateKey);
  }

  /**
   * 토큰 유효성 검사
   * @param token
   */
  verify(token: string): object | string {
    return jwt.verify(token, this.options.privateKey);
  }
}
