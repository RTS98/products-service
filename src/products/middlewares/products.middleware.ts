import { NestMiddleware } from '@nestjs/common';
import { Request, NextFunction, Response } from 'express';

export default class ProductsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`Request...: ${req.body}`);
    next();
  }
}
