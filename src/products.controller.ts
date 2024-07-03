import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly appService: ProductsService) {}

  @Get()
  getAll(): string {
    return 'All products';
  }

  @Get(':id')
  getById(@Param('id') id: string): string {
    return `Product by ${id}`;
  }

  @Post()
  createProduct(@Body() createProductDto: CreateProductDto): string {
    return 'Create product';
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
