import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SummarizeController } from './summarize/summarize.controller';
import { SummarizeService } from './summarize/summarize.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { SummarizeModule } from './summarize/summarize.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { RequestQueueService } from './summarize/request-queue.service';
import { SummarizeHelper } from './summarize/summarize.helper';
import { SummarizeUtility } from './summarize/summarize.utility';

@Module({
  imports: [
    HttpModule,
    ThrottlerModule.forRoot([
      {
        name: process.env.SUMMARY_GUARD,
        ttl: 60000, // 1 minute
        limit: 30, // Max 30 requests per minute
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true, // Makes the configuration globally available
    }),
    SummarizeModule,
  ],
  controllers: [AppController, SummarizeController],
  providers: [
    AppService,
    SummarizeService,
    RequestQueueService,
    SummarizeHelper,
    SummarizeUtility,
  ],
})
export class AppModule {}
