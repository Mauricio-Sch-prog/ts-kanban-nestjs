import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  private readonly saltRounds = 12;

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  private async validateById(id: string) {
    const user = await this.userRepository.findOneBy({ id: id });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await this.hashPassword(createUserDto.password);
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) throw new UnauthorizedException('email already in use');
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
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
