import { DynamicModule } from 'node_modules/@nestjs/common/interfaces/modules/dynamic-module.interface';
import { ResultMessage } from 'src/guards/validate-operation-otp';
import { OtpConfig } from 'src/otp/interfaces/otp-config.interface';

export class CommonModule {
  static forRoot(configs: OtpConfig): DynamicModule;
}

export class SendOperationOtpGuard {}

export class ValidatedOperationOtpGuard {}

export class OtpService {
  async validateOperationOtp(input: {
    operationUUID: string;
    otp: string;
  }): Promise<ResultMessage>;
}

export class CommonService {}
