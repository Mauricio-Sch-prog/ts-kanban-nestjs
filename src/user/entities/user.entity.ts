import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
  @Column({ nullable: true })
  name?: string;

  @Column({ unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  password!: string | null;

  @Column({ nullable: true, unique: true })
  googleId?: string;

  @Column({ nullable: true })
  avatarUrl?: string;
}
