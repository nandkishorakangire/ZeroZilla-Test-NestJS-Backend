import { Injectable } from '@nestjs/common';
import { SummarizeHelper } from './summarize.helper';
import { SummarizeUtility } from './summarize.utility';

@Injectable()
export class SummarizeService {
  constructor(
    private readonly summarizeHelper: SummarizeHelper,
    private readonly summarizeUtility: SummarizeUtility,
  ) {}

  async summarize(text: string, sentencesPerGroup: number): Promise<any> {
    const groups = this.summarizeHelper.splitTextIntoGroups(
      text,
      sentencesPerGroup,
    );
    const promiseArray = [];
    for (let i = 0; i < groups.length; i += 10) {
      promiseArray.push(
        this.summarizeUtility.generateTextSummary(groups.slice(i, i + 10)),
      );
    }
    const summaries = await Promise.all(promiseArray);
    return summaries;
  }
}
