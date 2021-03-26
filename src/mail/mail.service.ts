import got from 'got';
import * as FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'common/common.constant';
import { EmailVar, MailModuleOptions } from './mail.insterfaces';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    // console.log('mail options :', options);
  }

  /**
   * 이메일 보내기
   * @param subject - 메일 제목
   * @param template - 메일 템플릿
   * @param to - 받는 사람
   * @param emailVars - 이메일 variables
   */
  async sendEmail(
    subject: string,
    template: string,
    to = 'asco132@naver.com',
    emailVars: EmailVar[],
  ): Promise<boolean> {
    // curl -s --user 'api:YOUR_API_KEY' \
    // https://api.mailgun.net/v3/YOUR_DOMAIN_NAME/messages \
    // -F from='Excited User <mailgun@YOUR_DOMAIN_NAME>' \
    // -F to=YOU@YOUR_DOMAIN_NAME \
    // -F to=bar@example.com \
    // -F subject='Hello' \
    // -F text='Testing some Mailgun awesomeness!'
    const form = new FormData();
    form.append(
      'from',
      `Dillon from Nuber Eats <mailgun@${this.options.domain}>`,
    );
    form.append('to', to);
    form.append('subject', subject);
    form.append('template', template);
    emailVars.forEach(eVar => form.append(`v:${eVar.key}`, eVar.value));

    try {
      await got.post(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          body: form,
        },
      );

      return true;
    } catch (error) {
      return false;
    }
  }

  sendVerificationEmail(email: string, code: string): void {
    this.sendEmail('Verify Your Email', 'verify-email', 'asco132@naver.com', [
      { key: 'code', value: code },
      { key: 'username', value: email },
    ]);
  }
}
