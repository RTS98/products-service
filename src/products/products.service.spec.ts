import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DataSource, QueryRunner, Repository } from 'typeorm';

type ManagerMock = {
  findOneBy: jest.Mock;
  remove: jest.Mock;
  save: jest.Mock;
};

type MockType<T> = {
  [P in keyof T]?: jest.Mock<NonNullable<unknown>> & ManagerMock;
};

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

describe('ProductsService', () => {
  let productsService: ProductsService;
  let productsRepository: MockType<Repository<Product>>;
  let mockDataSource: MockType<DataSource>;
  let mockQueryRunner: MockType<QueryRunner>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getDataSourceToken(),
          useFactory: createDataSourceMock,
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
        {
          provide: 'QueryRunner',
          useValue: createQueryRunnerMock(),
        },
      ],
    }).compile();

    productsService = module.get<ProductsService>(ProductsService);
    productsRepository = module.get<MockType<Repository<Product>>>(
      getRepositoryToken(Product),
    );
    mockDataSource = module.get<MockType<DataSource>>(getDataSourceToken());
    mockQueryRunner = module.get<MockType<QueryRunner>>('QueryRunner');
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
            value: 'key',
          },
        },
        {
          id: 2,
          title: 'audi',
          price: 2000,
          description: 'car',
          quantity: 2,
          idempotencyKey: { id: 2, value: 'second-key' },
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
          value: 'first-key',
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
          value: 'first-key',
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
          value: 'key',
        },
      };

      mockDataSource.getRepository.mockReturnValue(productsRepository);
      productsRepository.create.mockReturnValue({ ...product, id: 1 });
      mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);
      mockQueryRunner.manager.save.mockReturnValue(savedProduct);

      const result = await productsService.create(product, 'key');

      expect(result).toEqual(savedProduct);
    });
    it('should not save the product if the idempotency key exists and return the existing product', async () => {
      const productDto: CreateProductDto = {
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
          value: 'key',
        },
      };

      mockDataSource.getRepository.mockReturnValue(productsRepository);
      productsRepository.create.mockReturnValue(savedProduct);
      productsRepository.findOne.mockReturnValue(savedProduct);
      mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);
      mockQueryRunner.manager.findOneBy.mockReturnValue({ id: 1, key: 'key' });

      const result = await productsService.create(productDto, 'key');

      expect(result).toEqual(savedProduct);
      expect(productsRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a product and return it if it exists', async () => {
      const updateProductDto: UpdateProductDto = {
        price: 2000,
        description: 'supersport car',
      };
      const product: Product = {
        id: 1,
        title: 'bmw',
        price: 1000,
        description: 'car',
        quantity: 1,
        idempotencyKey: {
          id: 1,
          value: 'key',
        },
      };
      const updatedProduct: Product = {
        id: 1,
        title: 'bmw',
        price: 2000,
        description: 'supersport car',
        quantity: 1,
        idempotencyKey: {
          id: 1,
          value: 'key',
        },
      };

      mockDataSource.getRepository.mockReturnValue(productsRepository);
      productsRepository.preload.mockReturnValue({
        ...product,
        ...updateProductDto,
      });
      productsRepository.save.mockReturnValue(updatedProduct);

      const result = await productsService.update(
        product.id.toString(),
        updateProductDto,
      );

      expect(result).toEqual(updatedProduct);
    });

    it("should throw an error if the product is not found and can't be updated", async () => {
      const updateProductDto: UpdateProductDto = {
        price: 2000,
        description: 'supersport car',
      };

      mockDataSource.getRepository.mockReturnValue(productsRepository);
      productsRepository.preload.mockReturnValue(undefined);

      const result = productsService.update('1', updateProductDto);

      await expect(result).rejects.toEqual(
        new NotFoundException(`Product with id 1 not found`),
      );
    });
  });

  describe('delete', () => {
    it("should delete a product and return it if it exists and it's deleted", async () => {
      const deleteProduct: Product = {
        id: 1,
        title: 'bmw',
        price: 1000,
        description: 'car',
        quantity: 2,
        idempotencyKey: {
          id: 1,
          value: 'key',
        },
      };

      mockDataSource.getRepository.mockReturnValue(productsRepository);
      productsRepository.findOne.mockReturnValue(deleteProduct);
      mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);
      mockQueryRunner.manager.remove.mockReturnValue(deleteProduct);

      const result = await productsService.delete(deleteProduct.id.toString());

      expect(result).toEqual(deleteProduct);
    });

    it("should throw an error if the product is not found and can't be deleted", async () => {
      mockDataSource.getRepository.mockReturnValue(productsRepository);
      productsRepository.findOne.mockReturnValue(undefined);

      const result = productsService.delete('1');

      await expect(result).rejects.toEqual(
        new NotFoundException(`Product with id 1 not found`),
      );
    });
  });
});
