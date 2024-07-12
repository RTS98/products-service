import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { IdempotencyKey } from './entities/idempotency-key.entity';

@Injectable()
export class ProductsService {
  constructor(private readonly dataSource: DataSource) {}

  private getProductRepository(): Repository<Product> {
    return this.dataSource.getRepository(Product);
  }

  async findAll(): Promise<Product[]> {
    const productsRepository = this.getProductRepository();

    return productsRepository.find();
  }

  async findOne(id: string): Promise<Product> {
    const productsRepository = this.getProductRepository();
    const product = await productsRepository.findOne({ where: { id: +id } });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  async create(
    product: CreateProductDto,
    idempotencyKey: string,
  ): Promise<Product> {
    const productsRepository = this.getProductRepository();
    const queryRunner = this.dataSource.createQueryRunner();
    let newProduct = productsRepository.create(product);

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const key = await queryRunner.manager.findOneBy(IdempotencyKey, {
        key: idempotencyKey,
      });

      if (!key) {
        const newKey = new IdempotencyKey();
        newKey.key = idempotencyKey;

        const key = await queryRunner.manager.save(newKey);
        newProduct.idempotencyKey = key;
        newProduct = await queryRunner.manager.save(newProduct);

        await queryRunner.commitTransaction();
      } else {
        newProduct = await productsRepository.findOne({
          where: { idempotencyKey: key },
        });
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return newProduct;
  }

  async update(id: string, product: UpdateProductDto): Promise<Product> {
    const productsRepository = this.getProductRepository();
    const updatedProduct = await productsRepository.preload({
      id: +id,
      ...product,
    });

    if (!updatedProduct) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return productsRepository.save(updatedProduct);
  }

  async delete(id: string): Promise<Product> {
    const productsRepository = this.getProductRepository();
    const product = await productsRepository.findOne({
      where: { id: +id },
      relations: ['idempotencyKey'],
    });
    const queryRunner = this.dataSource.createQueryRunner();

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    await queryRunner.manager.remove(IdempotencyKey, product.idempotencyKey);

    return product;
  }
}
