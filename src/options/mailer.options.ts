import { MailerSendMailOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-send-mail-options.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class MailerOptions implements MailerOptions {
  constructor(private configService: ConfigService) {}
}
