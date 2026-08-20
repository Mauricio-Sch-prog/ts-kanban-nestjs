import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailerService } from '@nestjs-modules/mailer';
import { resetPasswordMailTemplate } from './templates/resetPassword.template';
import { verifyAccountMailTemplate } from './templates/verifyAccount.template';

@Processor('mail')
export class MailProcessor extends WorkerHost {
  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async process(job: Job<{ email: string; token: string }>) {
    const { email, token } = job.data;
    switch (job.name) {
      case 'reset-password':
        await this.mailerService.sendMail(
          resetPasswordMailTemplate(email, token, process.env.FRONTEND_URI),
        );
        break;

      case 'verify-email':
        await this.mailerService.sendMail(
          verifyAccountMailTemplate(email, token, process.env.BACKEND_URI),
        );
    }
  }
}
