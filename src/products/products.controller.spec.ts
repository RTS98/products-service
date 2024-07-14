import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { getDataSourceToken } from '@nestjs/typeorm';

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

describe('AppController', () => {
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
  });
});
