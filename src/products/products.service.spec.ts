import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { IdempotencyKey } from './entities/idempotency-key.entity';

describe('ProductsService', () => {
  let productsService: ProductsService;
  let productsRepository: any;
  let mockDataSource: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getDataSourceToken(),
          useValue: {
            getRepository: jest.fn(),
            createQueryRunner: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(IdempotencyKey),
          useValue: {
            find: jest.fn(),
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            find: jest.fn(),
            findOneBy: jest.fn(),
            create: jest.fn(),
            preload: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    productsService = module.get<ProductsService>(ProductsService);
    productsRepository = module.get(getRepositoryToken(Product));
    mockDataSource = module.get(getDataSourceToken());
  });

  describe('find all', () => {
    it('should return an array of products', async () => {
      const products = [
        {
          id: 1,
          title: 'bmw',
          price: 1000,
          description: 'car',
          quantity: 1,
          idempotencyKey: {
            id: 1,
            key: 'key',
          },
        },
        {
          id: 2,
          title: 'audi',
          price: 2000,
          description: 'car',
          quantity: 2,
          idempotencyKey: { id: 2, key: 'second-key' },
        },
      ];
      mockDataSource.getRepository.mockReturnValue(productsRepository);
      productsRepository.find.mockReturnValue(products);

      console.log(await productsService.findAll());

      expect(await productsService.findAll()).toBe(products);
    });
  });
});
