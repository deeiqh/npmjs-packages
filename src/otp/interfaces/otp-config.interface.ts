import { CacheManagerOptions } from '@nestjs/common';
import { KafkaOptions } from '@nestjs/microservices';

export interface OtpConfig {
  otpMinutesToExpire?: number;
  cacheConfig: CacheManagerOptions;
  kafkaConfig: KafkaOptions;
}
