import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { BillingModule } from './billing.module';

const logger = new Logger('BillingService');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    BillingModule,
    new FastifyAdapter({ logger: false }),
  );

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({
    origin: process.env['ALLOWED_ORIGINS']?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('VTT Billing Service')
    .setDescription('Subscription management, plan features, and payment webhook handling')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Billing / Subscriptions')
    .build();

  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  const port = process.env['BILLING_PORT'] ?? 3070;
  await app.listen(port, '0.0.0.0');
  logger.log(`Billing Service running on port ${port}`);
}

bootstrap().catch((err) => {
  logger.error('Failed to start Billing Service', err);
  process.exit(1);
});
