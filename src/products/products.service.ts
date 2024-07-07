import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
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
    const newProduct = this.productsRepository.create(product);

    return this.productsRepository.save(newProduct);
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
