import { NestMiddleware } from '@nestjs/common';
import { Request, NextFunction, Response } from 'express';
import { createHash } from 'crypto';

export default class ProductsMiddleware implements NestMiddleware {
  use(req: Request, _: Response, next: NextFunction) {
    const hash = createHash('sha1');

    hash.update(JSON.stringify(req.body));
    req.headers['idempotency-key'] = hash.digest('hex');

    next();
  }
}
