import {
  CACHE_MANAGER,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
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
      context.switchToHttp().getRequest() ??
      GqlExecutionContext.create(context).getContext().req;

    if (!data) {
      this.logger.error(`${SendOperationOtpGuard.name}: Empty context data`);
      return false;
    }

    let targetType, target, operationUUID;

    switch (true) {
      case !!data.headers: {
        ({
          'otp-target-type': targetType,
          'otp-target': target,
          'otp-new-uuid-for-this-operation': operationUUID,
        } = data.headers);
        break;
      }
      case !!data.otpRpcData: {
        ({ targetType, target, operationUUID } = data.otpRpcData);
        break;
      }
    }

    if (!targetType || !target || !operationUUID) {
      this.logger.error('Data in headers not fulfilled');
      return false;
    }

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
