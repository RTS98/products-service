import { DataSourceOptions } from 'typeorm';

export default (): Partial<DataSourceOptions> => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_PORT,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: process.env.ENVIRONMENT !== 'production',
  entities: ['dist/products/entities/*.entity{.ts,.js}'],
  migrations: ['dist/products/migrations/*{.ts,.js}'],
});
