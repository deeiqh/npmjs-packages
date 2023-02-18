import { CacheManagerOptions } from '@nestjs/common';
import { KafkaOptions } from '@nestjs/microservices';

export interface ProvidersConfig {
  cacheConfig: CacheManagerOptions;
  kafkaConfig: KafkaOptions;
}
