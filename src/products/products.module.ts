import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { IdempotencyKey } from 'src/products/entities/idempotency-key.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, IdempotencyKey])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
