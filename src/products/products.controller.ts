import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponse } from './interfaces/product.interface';
import TransformInterceptor from './interceptors/transform.interceptor';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getAll(): Promise<ProductResponse[]> {
    console.log(await this.productsService.findAll());
    return this.productsService.findAll();
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<ProductResponse> {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseInterceptors(TransformInterceptor)
  createProduct(
    @Req() request: Request,
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponse> {
    return this.productsService.create(
      createProductDto,
      request.headers['idempotency-key'],
    );
  }

  @Put(':id')
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponse> {
    return this.productsService.update(id, updateProductDto);
  }

  @UseInterceptors(TransformInterceptor)
  @Delete(':id')
  deleteProduct(@Param('id') id: string): Promise<ProductResponse> {
    return this.productsService.delete(id);
  }
}
