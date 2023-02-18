import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Cache } from 'cache-manager';
import { EVALUATED_OPERATION_OTP } from './consts/events.const';

export interface ResultMessage {
  resultMessage: { message: string; statusCode: string };
}

@Injectable()
export class OtpService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject('CLIENT_KAFKA') private readonly clientKafka: ClientKafka,
  ) {}

  async validateOperationOtp(input: {
    operationUUID: string;
    otp: string;
  }): Promise<ResultMessage> {
    const { operationUUID, otp } = input;

    const { otp: otpCached } =
      ((await this.cacheManager.get(operationUUID)) as any) || {};

    const isValid = otpCached === otp;

    if (!otpCached || isValid) {
      this.clientKafka.emit(EVALUATED_OPERATION_OTP, {
        operationUUID,
        isValid,
      });

      if (!otpCached) {
        return {
          resultMessage: {
            message: 'Operation timed out',
            statusCode: '200',
          },
        };
      }

      await this.cacheManager.del(operationUUID);

      return {
        resultMessage: { message: 'Validated otp', statusCode: '200' },
      };
    }

    return {
      resultMessage: { message: 'Wrong otp', statusCode: '200' },
    };
  }
}
