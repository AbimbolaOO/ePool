import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import {
  IResetPasswordMailFormat,
  ISendAdminEmailPasswordMailFormat,
  ISignUpVerificationMailFormat,
  IUserSignupWelcomeMailFormat,
} from 'src/interface';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EmailTemplates } from './templates';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly mailgun: any;

  constructor(private configService: ConfigService) {
    this.mailgun = new Mailgun(FormData).client({
      username: this.configService.getOrThrow<string>('MAIL_GUN_USERNAME'),
      key: this.configService.getOrThrow<string>('MAIL_GUN_KEY'),
    });
  }

  async sendMail(mailFormat: object) {
    try {
      return await this.mailgun.messages.create(
        this.configService.getOrThrow<string>('MAIL_GUN_SANDBOX_URI'),
        {
          ...mailFormat,
          from: `EPool <${this.configService.getOrThrow<string>(
            'SENDER_EMAIL',
          )}>`,
        },
      );
    } catch (err) {
      console.log(err);
      throw new Error(err);
    }
  }

  sendAdminEmailPasswordMailFormat({
    email,
    password,
  }: ISendAdminEmailPasswordMailFormat) {
    return this.sendMail({
      to: [`${email}`],
      subject: 'EPool - Admin Welcome',
      html: EmailTemplates.sendAdminEmailPasswordTemplate(password),
    });
  }

  signUpVerificationMailFormat({
    email,
    otp,
    name,
  }: ISignUpVerificationMailFormat) {
    return this.sendMail({
      to: [`${email}`],
      subject: 'EPool - User Verification',
      html: EmailTemplates.emailVerificationTemplate(otp),
    });
  }

  resetPasswordMailFormat({ email, otp }: IResetPasswordMailFormat) {
    return this.sendMail({
      to: [`${email}`],
      subject: 'EPool - Password Reset',
      html: EmailTemplates.passwordResetTemplate(otp),
    });
  }

  adminPasswordResetMailFormat({ email, otp }: IResetPasswordMailFormat) {
    return this.sendMail({
      to: [`${email}`],
      subject: 'EPool - Admin Password Reset',
      html: EmailTemplates.adminPasswordResetTemplate(otp),
    });
  }

  setEmailOtpMailFormat({ email, otp }: IResetPasswordMailFormat) {
    return this.sendMail({
      to: [`${email}`],
      subject: 'EPool - Email Verification',
      html: EmailTemplates.verifyEmailEmailTemplate(otp),
    });
  }

  userSignupWelcomeMailFormat({ email, name }: IUserSignupWelcomeMailFormat) {
    return this.sendMail({
      to: [`${email}`],
      subject: 'Welcome to EPool',
      html: EmailTemplates.userSignupWelcomeMailFormat(name),
    });
  }
}
