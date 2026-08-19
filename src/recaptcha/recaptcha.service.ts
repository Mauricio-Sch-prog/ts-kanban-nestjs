import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface RecaptchaResponse {
  success: boolean;
  score: number;
  action: string;
  'error-codes'?: string[];
}

@Injectable()
export class RecaptchaService {
  private readonly secretKey: string;

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('RECAPTCHA_SECRET_KEY');
    if (!secretKey) {
      throw new Error('RECAPTCHA_SECRET_KEY is not configured');
    }

    this.secretKey = secretKey;
  }

  async verifyToken(
    token: string,
    expectedAction?: string,
    minScore = 0.5,
  ): Promise<boolean> {
    if (!token) {
      throw new BadRequestException('reCAPTCHA token is missing');
    }

    const params = new URLSearchParams({
      secret: this.secretKey,
      response: token,
    });

    const response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      },
    );

    const data: RecaptchaResponse = await response.json();

    if (!data.success) {
      throw new BadRequestException(
        `reCAPTCHA failed: ${data['error-codes']?.join(', ') || 'Invalid token'}`,
      );
    }

    if (expectedAction && data.action !== expectedAction) {
      throw new BadRequestException('reCAPTCHA action mismatch');
    }

    // Block requests below score threshold (e.g., score < 0.5 indicates a bot)
    if (data.score < minScore) {
      throw new ForbiddenException('Automated behavior detected');
    }

    return true;
  }
}
