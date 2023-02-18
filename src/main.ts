import { NestFactory } from '@nestjs/core';
import { CommonModule } from './common.module';

async function bootstrap() {
  await NestFactory.create(CommonModule);
}
bootstrap();
