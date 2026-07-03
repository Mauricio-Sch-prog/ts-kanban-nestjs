import { User } from 'src/user/entities/user.entity';

export type AuthenticatedUser = Omit<User, 'password'>;
