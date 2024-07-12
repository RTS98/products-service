import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import {
  getDataSourceToken,
  getEntityManagerToken,
  getRepositoryToken,
} from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { IdempotencyKey } from './entities/idempotency-key.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';

describe('ProductsService', () => {
  let productsService: ProductsService;
  let productsRepository: any;
  let mockDataSource: any;
  let mockManager: any;

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
        // {
        //   provide: getRepositoryToken(IdempotencyKey),
        //   useValue: {
        //     find: jest.fn(),
        //     findOneBy: jest.fn(),
        //     create: jest.fn(),
        //     save: jest.fn(),
        //   },
        // },
        {
          provide: getEntityManagerToken(),
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
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
    mockManager = module.get(getEntityManagerToken());
  });

  describe('find all', () => {
    it('should return an array of products', async () => {
      const products: Product[] = [
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
      const result = await productsService.findAll();

      expect(result).toEqual(products);
    });
  });

  describe('find one', () => {
    it('should return a product with the given id', async () => {
      const product: Product = {
        id: 1,
        title: 'bmw',
        price: 1000,
        description: 'car',
        quantity: 1,
        idempotencyKey: {
          id: 1,
          key: 'first-key',
        },
      };

      mockDataSource.getRepository.mockReturnValue(productsRepository);
      productsRepository.findOne.mockReturnValue(product);
      const result = await productsService.findOne(product.id.toString());

      expect(result).toEqual(product);
    });

    it('should throw an error if the product is not found', async () => {
      const product: Product = {
        id: 1,
        title: 'bmw',
        price: 1000,
        description: 'car',
        quantity: 1,
        idempotencyKey: {
          id: 1,
          key: 'first-key',
        },
      };
      mockDataSource.getRepository.mockReturnValue(productsRepository);
      productsRepository.findOne.mockReturnValue(undefined);
      const result = productsService.findOne(product.id.toString());

      await expect(result).rejects.toEqual(
        new NotFoundException(`Product with id ${product.id} not found`),
      );
    });
  });

  describe('create', () => {
    it("should create a new product and return it if the idempotency key doesn't exist", async () => {
      const product: CreateProductDto = {
        title: 'bmw',
        price: 1000,
        description: 'car',
        quantity: 2,
      };
      const savedProduct: Product = {
        id: 1,
        title: 'bmw',
        price: 1000,
        description: 'car',
        quantity: 2,
        idempotencyKey: {
          id: 1,
          key: 'key',
        },
      };

      mockDataSource.getRepository.mockReturnValue(productsRepository);
      productsRepository.create.mockReturnValue({ ...product, id: 1 });
      mockDataSource.createQueryRunner.mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        manager: mockManager,
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
      });
      mockManager.save.mockReturnValue(savedProduct);

      const result = await productsService.create(product, 'key');

      expect(result).toEqual(savedProduct);
    });
    it('should not save the product if the idempotency key exists and return the existing product', async () => {
      const product: CreateProductDto = {
        title: 'bmw',
        price: 1000,
        description: 'car',
        quantity: 2,
      };
      const savedProduct: Product = {
        id: 1,
        title: 'bmw',
        price: 1000,
        description: 'car',
        quantity: 2,
        idempotencyKey: {
          id: 1,
          key: 'key',
        },
      };

      mockDataSource.getRepository.mockReturnValue(productsRepository);
      productsRepository.create.mockReturnValue({ ...product, id: 1 });
      productsRepository.findOne.mockReturnValue(savedProduct);
      mockDataSource.createQueryRunner.mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        manager: mockManager,
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
      });
      mockManager.findOneBy.mockReturnValue({ id: 1, key: 'key' });

      const result = await productsService.create(product, 'key');

      expect(result).toEqual(savedProduct);
      expect(productsRepository.save).not.toHaveBeenCalled();
    });
  });
});
