import { Injectable } from '@nestjs/common';
import { Product } from './interfaces/product.interface';

@Injectable()
export class ProductsService {
  private readonly products: Product[] = [];

  public create(product: Product) {
    this.products.push(product);
  }

  public getAll(): Product[] {
    return this.products;
  }
}
