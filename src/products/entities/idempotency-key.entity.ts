import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class IdempotencyKey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  value: string;
}
