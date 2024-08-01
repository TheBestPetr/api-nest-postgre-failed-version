import jwt from 'jsonwebtoken';
import { SETTINGS } from '../../../settings/app.settings';

export class JwtService {
  createAccessJWTToken(userId: string) {
    return jwt.sign({ userId: userId }, SETTINGS.JWT_SECRET, {
      expiresIn: '5m',
    });
  }

  //   createRefreshJWTToken(userId: string, deviceId: string) {
  //   return jwt.sign(
  //     { userId: userId, deviceId: deviceId },
  //     SETTINGS.JWT_SECRET,
  //     { expiresIn: '20m' },
  //   );
  // }

  getUserIdByToken(token: string) {
    try {
      const result: any = jwt.verify(token, SETTINGS.JWT_SECRET);
      return result.userId.toString();
    } catch (e) {
      return null;
    }
  }

  // getTokenIatNExp(token: string) {
  //   try {
  //     const result: any = jwt.verify(token, SETTINGS.JWT_SECRET);
  //     return {
  //       iat: result.iat,
  //       exp: result.exp,
  //     };
  //   } catch (e) {
  //     return null;
  //   }
  // }

  // getDeviceIdByToken(token: string) {
  //   try {
  //     const result: any = jwt.verify(token, SETTINGS.JWT_SECRET);
  //     return result.deviceId.toString();
  //   } catch (e) {
  //     return null;
  //   }
  // }
}
