import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IdempotencyKey } from './idempotency-key.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  price: number;

  @Column()
  description: string;

  @Column()
  quantity: number;

  @OneToOne(() => IdempotencyKey, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  idempotencyKey?: IdempotencyKey;
}
