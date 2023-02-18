import {
  CacheManagerOptions,
  CacheModule,
  DynamicModule,
  Module,
} from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { EventEmitter } from 'events';
import { ConsumerConfig, Kafka, KafkaConfig } from 'kafkajs';
import {
  EVALUATED_OPERATION_OTP,
  EVALUATED_OPERATION_OTP_RESULT,
} from './consts/events.const';
import { DEFAULT_OTP_MINUTES_TO_EXPIRE } from './consts/guards.const';
import { SendOperationOtpGuard } from './guards/send-operation-otp.guard';
import { ValidatedOperationOtpGuard } from './guards/validated-operation-otp.guard';
import { OtpConfig } from './interfaces/otp-config.interface';
import { ProvidersConfig } from './interfaces/providers-config.interface';
import { OtpService } from './otp.service';

@Module({})
export class OtpModule {
  static forRoot(configs?: OtpConfig & ProvidersConfig): DynamicModule {
    if (!configs) {
      return { module: OtpModule };
    }

    const { cacheConfig, kafkaConfig } = configs;

    const otpMillisecondsToExpire =
      (configs.otpMinutesToExpire ?? DEFAULT_OTP_MINUTES_TO_EXPIRE) * 60 * 1000;

    return {
      module: OtpModule,
      imports: [
        CacheModule.register<CacheManagerOptions>({
          ...cacheConfig,
          ttl: otpMillisecondsToExpire,
        }),
        ClientsModule.register([{ name: 'CLIENT_KAFKA', ...kafkaConfig }]),
      ],
      providers: [
        EventEmitter,
        {
          provide: 'OTP_KAFKA_CONSUMER',
          useFactory: async (eventEmitter: EventEmitter) => {
            const kafka = new Kafka(
              kafkaConfig.options?.client as unknown as KafkaConfig,
            );

            const consumer = kafka.consumer(
              kafkaConfig.options?.consumer as unknown as ConsumerConfig,
            );
            await consumer.connect();
            await consumer.subscribe({
              topic: EVALUATED_OPERATION_OTP,
              fromBeginning: true,
            });

            await consumer.run({
              eachMessage: async ({ message }) => {
                const messageJson = JSON.parse(
                  message.value?.toString() as string,
                );

                eventEmitter.emit(EVALUATED_OPERATION_OTP_RESULT, {
                  operationUUID: messageJson.operationUUID,
                  isValid: messageJson.isValid,
                });
              },
            });

            return consumer;
          },
          inject: [EventEmitter],
        },
        SendOperationOtpGuard,
        ValidatedOperationOtpGuard,
        OtpService,
      ],
      exports: [
        CacheModule,
        ClientsModule,
        EventEmitter,
        {
          provide: 'OTP_MILLISECONDS_TO_EXPIRE',
          useValue: otpMillisecondsToExpire,
        },
        SendOperationOtpGuard,
        ValidatedOperationOtpGuard,
        OtpService,
      ],
    };
  }
}
