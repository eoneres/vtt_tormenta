import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NotificationModule } from './notification.module';

const logger = new Logger('NotificationService');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    NotificationModule,
    new FastifyAdapter({ logger: false }),
  );

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: process.env['ALLOWED_ORIGINS']?.split(',') ?? ['http://localhost:3000'], credentials: true });

  const config = new DocumentBuilder()
    .setTitle('VTT Notification Service')
    .setDescription('Real-time in-app notifications via SSE, email, and push')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  const port = process.env['NOTIFICATION_PORT'] ?? 3050;
  await app.listen(port, '0.0.0.0');
  logger.log(`Notification Service running on port ${port}`);
}

bootstrap().catch((err) => { logger.error('Failed to start', err); process.exit(1); });
