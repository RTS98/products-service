import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './interfaces/product.interface';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getAll(): Promise<Product[]> {
    return this.productsService.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string): string {
    return `Product by ${id}`;
  }

  @Post()
  createProduct(
    @Req() request: Request,
    @Body() createProductDto: CreateProductDto,
  ): void {
    this.productsService.create(
      createProductDto,
      request.headers['idempotency-key'],
    );
  }

  @Put(':id')
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): string {
    return `Update product by ${id}`;
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string): string {
    return `Delete product by ${id}`;
  }
}
