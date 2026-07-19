import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
import { Public } from 'src/common/decorator/public.decorator';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import type { AuthenticatedUser } from 'src/common/type/authenticatedUser.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post()
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const jwtToken = await this.authService.login(loginDto);

    res.cookie('access_token', jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 2,
    });

    return 'Logged succesfully';
  }

  @Public()
  @Get()
  check(@CurrentUser() user: AuthenticatedUser | null) {
    return user;
  }
}
