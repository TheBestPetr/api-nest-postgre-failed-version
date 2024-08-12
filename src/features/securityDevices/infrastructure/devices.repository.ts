import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceModelType } from '../domain/device.entity';
import { RefreshTokenRepository } from '../../auth/infrastructure/refrest.token.repository';
import { JwtService } from '../../../infrastructure/utils/services/jwt.service';
import { DeviceOutputDto } from '../api/dto/output/device.output.dto';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectModel(Device.name) private DeviceModel: DeviceModelType,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
  ) {}
  async create(input: Device): Promise<boolean> {
    const result = await this.DeviceModel.create(input);
    return !!result;
  }

  async updateIatNExp(
    deviceId: string,
    oldIat: string,
    iat: string,
    exp: string,
  ): Promise<boolean> {
    const result = await this.DeviceModel.updateOne(
      { deviceId: deviceId, iat: oldIat },
      { $set: { iat: iat, exp: exp } },
    ).exec();
    return !!result.matchedCount;
  }

  async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
    const result = await this.DeviceModel.deleteOne({
      deviceId: deviceId,
    }).exec();
    return !!result.deletedCount;
  }

  async deleteAllSessions(deviceId: string): Promise<boolean> {
    const result = await this.DeviceModel.deleteMany({
      deviceId: { $nin: [deviceId] },
    }).exec();
    return !!result.deletedCount;
  }

  async findActiveSessions(
    refreshToken: string,
  ): Promise<DeviceOutputDto[] | null> {
    const isTokenInBlackList =
      await this.refreshTokenRepository.isTokenInBlacklist(refreshToken);
    const userId = this.jwtService.getUserIdByToken(refreshToken);
    const activeSessions = await this.DeviceModel.find({
      userId: userId,
    }).exec();
    if (!userId || !activeSessions || isTokenInBlackList) {
      return null;
    }
    return activeSessions.map((device) => ({
      ip: device.ip,
      title: device.deviceName,
      lastActiveDate: device.iat,
      deviceId: device.deviceId,
    }));
  }

  async findSessionByDeviceId(deviceId: string): Promise<string | null> {
    const session = await this.DeviceModel.findOne({
      deviceId: deviceId,
    }).exec();
    if (session) {
      return session.userId;
    }
    return null;
  }
}
