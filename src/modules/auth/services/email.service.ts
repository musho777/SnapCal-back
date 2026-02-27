import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Send verification code to user's email
   * TODO: Integrate with actual email service (SendGrid, AWS SES, Mailgun, etc.)
   */
  async sendVerificationCode(email: string, code: string): Promise<void> {
    this.logger.log(`Sending verification code to ${email}`);

    // TODO: Replace with actual email service integration
    // Example with SendGrid:
    // const msg = {
    //   to: email,
    //   from: this.configService.get('EMAIL_FROM'),
    //   subject: 'Verify Your Email - SnapCal',
    //   text: `Your verification code is: ${code}`,
    //   html: `<p>Your verification code is: <strong>${code}</strong></p>`,
    // };
    // await this.sgMail.send(msg);

    // For development: Just log the code
    this.logger.log(`Verification code for ${email}: ${code}`);
    console.log(`\n📧 EMAIL VERIFICATION CODE for ${email}: ${code}\n`);
  }

  /**
   * Send welcome email after successful registration
   */
  async sendWelcomeEmail(email: string, name?: string): Promise<void> {
    this.logger.log(`Sending welcome email to ${email}`);

    // TODO: Implement welcome email
    const greeting = name ? `Hi ${name}` : 'Hi';
    console.log(`\n📧 WELCOME EMAIL to ${email}: ${greeting}, welcome to SnapCal!\n`);
  }
}
