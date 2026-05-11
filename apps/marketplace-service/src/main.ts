import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MarketplaceModule } from './marketplace.module';

async function bootstrap() {
  const app = await NestFactory.create(MarketplaceModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3003);
}

bootstrap();
