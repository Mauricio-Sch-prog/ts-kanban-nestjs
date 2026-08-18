import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import type { Response } from 'express';
import { Public } from 'src/common/decorator/public.decorator';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import type { AuthenticatedUser } from 'src/common/type/authenticatedUser.interface';
import { GoogleCredentialsDto } from './dto/googleCredentials.dto';

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
  @Get()
  check(@CurrentUser() user: AuthenticatedUser | null) {
    return user;
  }
}
