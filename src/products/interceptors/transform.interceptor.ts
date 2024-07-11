import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Product } from '../entities/product.entity';
import { ProductResponse } from '../interfaces/product.interface';

export default class TransformInterceptor<T>
  implements NestInterceptor<T, ProductResponse>
{
  intercept(
    _: ExecutionContext,
    next: CallHandler,
  ): Observable<ProductResponse> {
    return next.handle().pipe(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      map(({ idempotencyKey, ...rest }: Product) => rest),
    );
  }
}
