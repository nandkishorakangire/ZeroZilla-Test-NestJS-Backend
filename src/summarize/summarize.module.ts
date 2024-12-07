import { Module } from '@nestjs/common';
import { SummarizeService } from './summarize.service';
import { SummarizeController } from './summarize.controller';
import { HttpModule } from '@nestjs/axios';
import { RequestQueueService } from './request-queue.service';
// import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [HttpModule],
  controllers: [SummarizeController],
  providers: [
    SummarizeService,
    RequestQueueService,
    // {
    //   provide: process.env.SUMMARY_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
  exports: [SummarizeService],
})
export class SummarizeModule {}
