import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { ReqCount, ReqCountModelType } from './req.ip.count.entity';

@Injectable()
export class ReqIpCounterMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(ReqCount.name)
    private readonly ReqCountModel: ReqCountModelType,
  ) {}
  async use(req: Request, next: NextFunction) {
    await this.ReqCountModel.create({
      ip: req.ip!,
      URL: req.originalUrl,
      date: new Date(),
    });

    const currentDate = new Date();
    const tenSecondsAgo = currentDate.setSeconds(currentDate.getSeconds() - 10);
    const reqCount = await this.ReqCountModel.countDocuments({
      ip: req.ip,
      URL: req.originalUrl,
      date: { $gte: new Date(tenSecondsAgo) },
    });
    if (reqCount > 5) {
      throw new Error();
    }

    next();
  }
}
