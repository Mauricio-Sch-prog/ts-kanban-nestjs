import { Module } from '@nestjs/common';
import { RecaptchaService } from './recaptcha.service';
import { RecaptchaGuard } from './recaptcha.guard';

@Module({
  providers: [RecaptchaService, RecaptchaGuard],
  exports: [RecaptchaService],
})
export class RecaptchaModule {}
