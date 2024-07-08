import { DataSource } from 'typeorm';

const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'products',
  synchronize: true,
  entities: [
    'dist/products/entities/*.entity{.ts,.js}',
    'dist/idempotency/entities/*.entity{.ts,.js}',
  ],
  migrations: ['dist/migrations/*{.ts,.js}'],
});

export default dataSource;
