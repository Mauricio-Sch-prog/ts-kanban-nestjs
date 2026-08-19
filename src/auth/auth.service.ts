// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import TokenPayload from './interfaces/token.interface';
import { SignupDto } from './dto/signup.dto';
import { OAuth2Client } from 'google-auth-library';
import { MailerService } from '@nestjs-modules/mailer';
import { randomBytes, createHash } from 'crypto';
import { verifyAccountMailTemplate } from 'src/common/mail/templates/verifyAccount.template';
import { VerifyEmailDto } from './dto/verifyEmail.dto';
import { resetPasswordMailTemplate } from 'src/common/mail/templates/resetPassword.template';
import { ResetPasswordDto } from './dto/resetPassword.dto';

@Injectable()
export class AuthService {
  private readonly googleClient = new OAuth2Client(
    process.env.PUBLIC_GOOGLE_CLIENT_ID,
  );
  constructor(
    private userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  private readonly saltRounds = 12;

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  private generateToken() {
    const unHashedToken = randomBytes(20).toString('hex');
    const hashedToken = createHash('SHA256')
      .update(unHashedToken)
      .digest('hex');

    const tokenExpiry = new Date(Date.now() + 20 * 60 * 1000);
    return { token: hashedToken, expiry: tokenExpiry };
  }

  private generateJtwToken(user: Pick<User, 'id' | 'email'>): string {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }

  async signup(signupDto: SignupDto) {
    const existingUser = await this.userService.findByEmail(signupDto.email);
    const hashedPassword = await this.hashPassword(signupDto.password);

    if (existingUser) {
      if (!existingUser.isVerified) {
        const newToken = this.generateToken();
        await this.mailerService.sendMail(
          verifyAccountMailTemplate(
            signupDto.email,
            newToken.token,
            process.env.BACKEND_URI,
          ),
        );
        return await this.userService.update(existingUser.id, {
          verificationToken: newToken.token,
          verificationTokenExpiry: newToken.expiry,
        });
      }
      throw new UnauthorizedException('email already in use');
    }

    const token = this.generateToken();

    await this.mailerService.sendMail(
      verifyAccountMailTemplate(
        signupDto.email,
        token.token,
        process.env.BACKEND_URI,
      ),
    );

    return await this.userService.create({
      ...signupDto,
      password: hashedPassword,
      verificationToken: token.token,
      verificationTokenExpiry: token.expiry,
    });
  }

  async login(loginDto: LoginDto): Promise<string> {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      if (process.env.ISVERIFIEDCHECK === 'true')
        throw new UnauthorizedException('User is not verified');
    }

    return this.generateJtwToken(user);
  }

  async google(credential: string): Promise<string> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Invalid Google account');
    }

    const googleId = payload.sub;

    let user = await this.userService.findByGoogleId(googleId);

    if (!user) {
      user = await this.userService.findByEmail(payload.email);
    }

    if (!user) {
      user = await this.userService.create({
        email: payload.email,
        name: payload.name ?? 'Google User',
        googleId,
        avatarUrl: payload.picture || undefined,
        isVerified: true,
      });
    } else if (!user.googleId) {
      user = await this.userService.update(user.id, {
        googleId,
        avatarUrl: payload.picture || undefined,
        isVerified: true,
      });
    }

    return this.generateJtwToken(user);
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { token, email } = verifyEmailDto;
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid Email');
    }

    if (user.verificationToken !== token) {
      throw new UnauthorizedException('Invalid token');
    }

    if (
      !user.verificationTokenExpiry ||
      user.verificationTokenExpiry < new Date()
    ) {
      throw new UnauthorizedException('Verification token has expired');
    }

    await this.userService.update(user.id, {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    });

    return 'Your account has been successfully validated';
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findByEmail(email);

    if (user) {
      const token = this.generateToken();
      await this.mailerService.sendMail(
        resetPasswordMailTemplate(email, token.token, process.env.FRONTEND_URI),
      );
      await this.userService.update(user.id, {
        resetPasswordToken: token.token,
        resetPasswordTokenExpiry: token.expiry,
      });
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.userService.findByEmail(resetPasswordDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }
    if (user.resetPasswordToken !== resetPasswordDto.token) {
      console.log(resetPasswordDto);
      throw new UnauthorizedException('Invalid Token');
    }

    if (
      !user.resetPasswordTokenExpiry ||
      user.resetPasswordTokenExpiry < new Date()
    ) {
      throw new UnauthorizedException('Token has expired');
    }

    const hashedPassword = await this.hashPassword(resetPasswordDto.password);
    return await this.userService.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordTokenExpiry: null,
    });
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
