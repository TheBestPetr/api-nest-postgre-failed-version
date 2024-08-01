import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '../utils/services/jwt.service';

@Injectable()
export class BearerAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const header = request.header('Authorization');
    if (!header) {
      throw new UnauthorizedException();
    }

    const parts = header.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException();
    }

    const token = parts[1];

    try {
      const userId = await this.jwtService.getUserIdByToken(token);
      request['userId'] = userId;
      return true;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
