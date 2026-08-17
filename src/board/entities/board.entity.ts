import { BaseEntity } from 'src/common/entities/base.entity';
import { Lane } from 'src/lane/entities/lane.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity('boards')
export class Board extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'double precision', default: 100 })
  positionX!: number;

  @Column({ type: 'double precision', default: 100 })
  positionY!: number;

  @Column({ type: 'double precision', default: 1 })
  positionZ!: number;

  @Column({ type: 'double precision', default: 400 })
  height!: number;

  @Column({ type: 'double precision', default: 300 })
  width!: number;

  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @OneToMany('Lane', (lane: Lane) => lane.board)
  lanes!: Lane[];
}
