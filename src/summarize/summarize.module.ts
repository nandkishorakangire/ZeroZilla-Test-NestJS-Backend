import { Module } from '@nestjs/common';
import { SummarizeService } from './summarize.service';
import { SummarizeController } from './summarize.controller';
import { HttpModule } from '@nestjs/axios';
// import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [HttpModule],
  controllers: [SummarizeController],
  providers: [
    SummarizeService,
    // {
    //   provide: process.env.SUMMARY_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
  exports: [SummarizeService],
})
export class SummarizeModule {}
