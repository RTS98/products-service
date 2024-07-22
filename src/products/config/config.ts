import { DataSource, DataSourceOptions } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_PORT,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: process.env.ENVIRONMENT !== 'production',
  entities: ['dist/products/entities/*.entity{.ts,.js}'],
  migrations: ['dist/products/migrations/*{.ts,.js}'],
};

const config = new DataSource(dataSourceOptions);

export default config;

export function configTypeOrm(): Partial<DataSourceOptions> {
  return dataSourceOptions;
}
