import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { CompendiumModule } from './compendium.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    CompendiumModule,
    new FastifyAdapter(),
  );

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  app.setGlobalPrefix('api/v2/compendium');

  await app.listen(3003, '0.0.0.0');
  console.log('Compendium Service listening on port 3003');
}

bootstrap();