// recaptcha.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RecaptchaService } from './recaptcha.service';
import { RECAPTCHA_ACTION_KEY } from './recaptcha.decorator';

type RecaptchaRequest = {
  headers?: Record<string, string | string[] | undefined>;
  body?: {
    recaptchaToken?: string;
  };
};

@Injectable()
export class RecaptchaGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly recaptchaService: RecaptchaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const expectedAction = this.reflector.get<string>(
      RECAPTCHA_ACTION_KEY,
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest<RecaptchaRequest>();

    const headerToken = request.headers?.['x-recaptcha-token'];
    const token = Array.isArray(headerToken)
      ? headerToken[0]
      : (headerToken ?? request.body?.recaptchaToken);
    if (!token) {
      return false;
    }

    await this.recaptchaService.verifyToken(token, expectedAction, 0.5);

    return true;
  }
}
