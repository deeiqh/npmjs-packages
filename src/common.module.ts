import { DynamicModule, Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { OtpConfig } from './otp/interfaces/otp-config.interface';
import { ProvidersConfig } from './otp/interfaces/providers-config.interface';
import { OtpModule } from './otp/otp.module';

@Module({
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {
  static forRoot(configs: OtpConfig & ProvidersConfig): DynamicModule {
    return {
      module: CommonModule,
      imports: [OtpModule.forRoot(configs)],
      exports: [OtpModule],
    };
  }
}
