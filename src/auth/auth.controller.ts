import { Body, Controller, Get, Post, Query, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import type { Response } from 'express';
import { Public } from 'src/common/decorator/public.decorator';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import type { AuthenticatedUser } from 'src/common/type/authenticatedUser.interface';
import { GoogleCredentialsDto } from './dto/googleCredentials.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { VerifyEmailDto } from './dto/verifyEmail.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    await this.authService.signup(signupDto);
    return 'Signed up successfully';
  }

  @Public()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const jwtToken = await this.authService.login(loginDto);

    res.cookie('access_token', jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 4,
    });

    return 'Logged successfully';
  }

  @Public()
  @Post('google')
  async google(
    @Body() googleCredentials: GoogleCredentialsDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const jwtToken = await this.authService.google(
      googleCredentials.credential,
    );

    res.cookie('access_token', jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 4,
    });

    return 'Logged successfully';
  }

  @Get('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });

    return 'Logged out';
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto.email);
    return `Restore password sent to ${forgotPasswordDto.email}`;
  }

  @Public()
  @Get('verify-email')
  async verifyEmail(
    @Query() verifyEmailDto: VerifyEmailDto,
    @Res() res: Response,
  ) {
    try {
      await this.authService.verifyEmail(verifyEmailDto);

      return res.redirect(
        `${process.env.FRONTEND_URI}/auth/account-validation?status=success`,
      );
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return res.redirect(
          `${process.env.FRONTEND_URI}/auth/account-validation?status=error`,
        );
      }

      return res.redirect(
        `${process.env.FRONTEND_URI}/auth/account-validation?status=error`,
      );
    }
  }

  @Public()
  @Get()
  check(@CurrentUser() user: AuthenticatedUser | null) {
    return user;
  }
}
