import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { InfrastructureEntryModule } from './infrastructure/entry.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/compendium',
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),
    InfrastructureEntryModule,
  ],
  controllers: [],
  providers: [],
})
export class CompendiumModule {}