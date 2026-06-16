import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Task } from 'src/task/entities/task.entity';

@Entity('tags')
export class Tag extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task!: Task;
}
