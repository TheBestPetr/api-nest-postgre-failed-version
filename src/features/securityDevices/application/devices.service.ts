import { Injectable } from '@nestjs/common';
import { JwtService } from '../../../infrastructure/utils/services/jwt.service';
import { DevicesRepository } from '../infrastructure/devices.repository';
import { Device } from '../domain/device.entity';

@Injectable()
export class DevicesService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly devicesRepository: DevicesRepository,
  ) {}
  async createDevice(input: Device): Promise<boolean> {
    return await this.devicesRepository.create(input);
  }

  async updateDeviceIatNExp(
    deviceId: string,
    oldIat: string,
    iat: string,
    exp: string,
  ): Promise<boolean> {
    return await this.devicesRepository.updateIatNExp(
      deviceId,
      oldIat,
      iat,
      exp,
    );
  }

  async findSessionToTerminate(deviceId: string): Promise<string | null> {
    return await this.devicesRepository.findSessionByDeviceId(deviceId);
  }

  async isUserCanTerminateSession(
    refreshToken: string,
    deviceId: string,
  ): Promise<boolean> {
    const userId = this.jwtService.getUserIdByToken(refreshToken);
    const isSessionBelongsToUser =
      await this.devicesRepository.findSessionByDeviceId(deviceId);
    if (userId !== isSessionBelongsToUser) {
      return false;
    }
    return await this.devicesRepository.deleteSessionByDeviceId(deviceId);
  }

  async terminateAllSessions(refreshToken: string): Promise<boolean> {
    const deviceId = this.jwtService.getDeviceIdByToken(refreshToken);
    return await this.devicesRepository.deleteAllSessions(deviceId);
  }
}
