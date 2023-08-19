import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private mailService: MailerService) {}

  async sendMailRegistration(email: string, uuid: string) {
    const mailOptions = {
      from: process.env.EMAIL_ADDRES,
      to: email,
      subject: 'registration confirm',
      html: `<h1>Thank for your registration</h1>
                 <p>To finish registration please follow the link below:
                    <a href='http://localhost:5001/auth/registration-confirmation?code=${uuid}'>complete registration</a>
                 </p>`,
    };
    console.log(`📩 send email to ${email}`);
    return this.mailService.sendMail(mailOptions);
  }
}
