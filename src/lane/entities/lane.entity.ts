import { BaseEntity } from 'src/common/entities/base.entity';
import { Board } from '../../board/entities/board.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('lanes')
export class Lane extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @ManyToOne(() => Board, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'boardId' })
  board: Board;
}