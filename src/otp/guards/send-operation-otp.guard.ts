import {
  CACHE_MANAGER,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Cache } from 'cache-manager';
import { SEND_OPERATION_OTP } from '../consts/events.const';

@Injectable()
export class SendOperationOtpGuard implements CanActivate {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject('CLIENT_KAFKA') private readonly clientKafka: ClientKafka,
  ) {}

  logger = new Logger(SendOperationOtpGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const data =
      context.switchToRpc().getData() || context.switchToHttp().getRequest();

    if (!data?.otpHeaders) {
      this.logger.error(
        `[Error] ${SendOperationOtpGuard.name}: Empty context data`,
      );
      return false;
    }

    const { targetType, target, operationUUID } = data.otpHeaders;

    const numberDigits = 6;
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    let otp = '';
    for (let i = numberDigits; i > 0; --i) {
      otp += chars[Math.round(Math.random() * (chars.length - 1))];
    }
    otp = otp.toUpperCase();

    this.clientKafka.emit(SEND_OPERATION_OTP, {
      targetType,
      target,
      otp,
    });

    await this.cacheManager.set(operationUUID, {
      otp,
    });

    return true;
  }
}
