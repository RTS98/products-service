import { IdempotencyKey } from 'src/products/entities/idempotency-key.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @OneToOne(() => IdempotencyKey)
  @JoinColumn()
  idempotencyKey: number;
}
