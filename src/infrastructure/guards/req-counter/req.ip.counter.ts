import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Request, response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { ReqCount, ReqCountModelType } from './req.ip.count.entity';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class ReqIpCounter implements CanActivate {
  constructor(
    @InjectModel(ReqCount.name)
    private readonly ReqCountModel: ReqCountModelType,
  ) {}
  async canActivate(context: ExecutionContext): Promise<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const { ip, originalUrl } = req;
    await this.ReqCountModel.create({
      ip: ip,
      URL: originalUrl,
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
      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
