import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, Column } from 'typeorm';

@Entity('boards')
export class Board extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name: string;
}