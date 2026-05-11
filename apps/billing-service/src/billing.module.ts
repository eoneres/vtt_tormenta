import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { BillingController } from './infrastructure/http/controllers/billing.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), TerminusModule],
  controllers: [BillingController],
})
export class BillingModule {}
