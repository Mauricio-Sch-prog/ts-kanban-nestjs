import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private async validateById(id: string) {
    const user = await this.userRepository.findOneBy({ id: id });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  findAll() {
    const users = this.userRepository.find();
    return users;
  }

  async findOne(id: string) {
    return await this.validateById(id);
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      withDeleted: true,
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        isVerified: true,
        verificationToken: true,
        verificationTokenExpiry: true,
        resetPasswordToken: true,
        resetPasswordTokenExpiry: true,
      },
    });
    return user;
  }

  async findByGoogleId(googleId: string) {
    const user = await this.userRepository.findOne({
      where: { googleId },
      withDeleted: true,
      select: {
        id: true,
        email: true,
        avatarUrl: true,
        name: true,
        googleId: true,
      },
    });
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.validateById(id);
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: string) {
    const user = await this.validateById(id);
    await this.userRepository.softRemove(user);
  }
}
