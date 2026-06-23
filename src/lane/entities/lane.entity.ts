import { BaseEntity } from 'src/common/entities/base.entity';
import { Board } from '../../board/entities/board.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Entity('lanes')
export class Lane extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @ManyToOne(() => Board, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'boardId' })
  board!: Board;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;
}
