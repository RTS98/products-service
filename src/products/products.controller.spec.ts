import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { getDataSourceToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const createQueryRunnerMock = () => ({
  manager: {
    findOneBy: jest.fn(),
    remove: jest.fn(),
    save: jest.fn(),
  },
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
});

const createDataSourceMock = () => ({
  getRepository: jest.fn(),
  createQueryRunner: jest.fn(createQueryRunnerMock),
});

describe('Products Controller', () => {
  let productsController: ProductsController;
  let productsService: ProductsService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        ProductsService,
        {
          provide: getDataSourceToken(),
          useFactory: createDataSourceMock,
        },
      ],
    }).compile();

    productsController = app.get<ProductsController>(ProductsController);
    productsService = app.get<ProductsService>(ProductsService);
  });

  describe('get', () => {
    it('should return all products', async () => {
      const products: Product[] = [
        {
          id: 1,
          title: 'bmw',
          price: 1000,
          description: 'car',
          quantity: 1,
        },
        {
          id: 2,
          title: 'audi',
          price: 2000,
          description: 'car',
          quantity: 2,
        },
      ];

      jest.spyOn(productsService, 'findAll').mockResolvedValue(products);
      expect(await productsController.getAll()).toEqual(products);
    });

    it('should return product with given id', async () => {
      const product: Product = {
        id: 1,
        title: 'bmw',
        price: 1000,
        description: 'car',
        quantity: 1,
      };

      jest.spyOn(productsService, 'findOne').mockResolvedValue(product);
      expect(await productsController.getById('1')).toEqual(product);
    });

    it('should throw error when product with given id does not exist', async () => {
      jest
        .spyOn(productsService, 'findOne')
        .mockRejectedValue(
          new NotFoundException('Product with id 1 not found'),
        );
      await expect(productsController.getById('1')).rejects.toEqual(
        new NotFoundException('Product with id 1 not found'),
      );
    });
  });

  describe('post', () => {
    it('should create product', async () => {
      const product: CreateProductDto = {
        title: 'bmw',
        price: 1000,
        description: 'car',
        quantity: 1,
      };
      const req: Partial<Request> = {
        headers: new Headers(),
      };

      req.headers.set('idempotency-key', 'first-key');

      jest
        .spyOn(productsService, 'create')
        .mockResolvedValue({ id: 1, ...product });

      expect(
        await productsController.createProduct(req as Request, product),
      ).toEqual({
        ...product,
        id: 1,
      });
    });
  });
  describe('update', () => {
    it("should update product's title", async () => {
      const product: Product = {
        id: 1,
        title: 'bmw',
        price: 2000,
        description: 'supersport car',
        quantity: 1,
      };

      const updateProduct: UpdateProductDto = {
        price: 2000,
        description: 'supersport car',
      };

      jest.spyOn(productsService, 'update').mockResolvedValue(product);

      expect(
        await productsController.updateProduct('1', updateProduct),
      ).toEqual(product);
    });

    it('should throw error when product with given id does not exist', async () => {
      const updateProduct: UpdateProductDto = {
        price: 2000,
        description: 'supersport car',
      };

      jest
        .spyOn(productsService, 'update')
        .mockRejectedValue(
          new NotFoundException('Product with id 1 not found'),
        );
      await expect(
        productsController.updateProduct('1', updateProduct),
      ).rejects.toEqual(new NotFoundException('Product with id 1 not found'));
    });
  });
  describe('delete', () => {
    it('should delete product with given id', async () => {
      const product: Product = {
        id: 1,
        title: 'bmw',
        price: 1000,
        description: 'car',
        quantity: 1,
      };

      jest.spyOn(productsService, 'delete').mockResolvedValue(product);

      expect(await productsController.deleteProduct('1')).toEqual(product);
    });

    it('should throw error when product with given id does not exist', async () => {
      jest
        .spyOn(productsService, 'delete')
        .mockRejectedValue(
          new NotFoundException('Product with id 1 not found'),
        );
      await expect(productsController.deleteProduct('1')).rejects.toEqual(
        new NotFoundException('Product with id 1 not found'),
      );
    });
  });
});
