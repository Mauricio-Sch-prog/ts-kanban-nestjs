import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Lane } from 'src/lane/entities/lane.entity';

@Entity('tasks')
export class Task extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => Lane, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'laneId' })
  lane: Lane;
}