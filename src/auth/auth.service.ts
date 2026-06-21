// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import TokenPayload from './interfaces/token.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<string> {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateJtwToken(user);
  }

  generateJtwToken(user: Pick<User, 'id' | 'email'>): string {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }

  async validateToken(token: string) {
    try {
      const payload: TokenPayload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.userService.findOne(payload.sub);

      if (!user) throw new UnauthorizedException('User not found');

      return user;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
