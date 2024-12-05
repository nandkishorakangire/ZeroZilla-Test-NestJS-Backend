import { Controller, Post, Body } from '@nestjs/common';
import { SummarizeService } from './summarize.service';

@Controller('summarize')
export class SummarizeController {
  constructor(private readonly summarizeService: SummarizeService) {}

  @Post()
  async summarizeText(
    @Body() body: { text: string; sentencesPerGroup: number },
  ) {
    return this.summarizeService.summarize(body.text, body.sentencesPerGroup);
  }
}
