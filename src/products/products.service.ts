import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { IdempotencyKey } from 'src/idempotency/entities/idempotency-key.entity';

@Injectable()
export class ProductsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOneBy({ id: +id });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  async create(product: CreateProductDto, idempotencyKey: string) {
    let newProduct = this.productsRepository.create(product);
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const key = await queryRunner.manager.findOneBy(IdempotencyKey, {
        key: idempotencyKey,
      });

      if (!key) {
        const newKey = new IdempotencyKey();
        newKey.key = idempotencyKey;

        newProduct = await queryRunner.manager.save(newProduct);
        await queryRunner.manager.save(newKey);
        await queryRunner.commitTransaction();
      } else {
        newProduct = await queryRunner.manager.findOneBy(Product, newProduct);
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return newProduct;
  }

  async update(id: string, product: UpdateProductDto) {
    const updatedProduct = await this.productsRepository.preload({
      id: +id,
      ...product,
    });

    console.log(updatedProduct);

    if (!updatedProduct) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return this.productsRepository.save(updatedProduct);
  }

  async delete(id: string): Promise<Product> {
    const product = await this.findOne(id);

    return this.productsRepository.remove(product);
  }
}
