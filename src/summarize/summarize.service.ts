import { Injectable } from '@nestjs/common';
import { SummarizeHelper } from './summarize.helper';
import { SummarizeUtility } from './summarize.utility';

@Injectable()
export class SummarizeService {
  constructor(
    private readonly summarizeHelper: SummarizeHelper,
    private readonly summarizeUtility: SummarizeUtility,
  ) {}

  async summarize(text: string, sentencesPerGroup: number): Promise<any[]> {
    const groups = this.summarizeHelper.splitTextIntoGroups(
      text,
      sentencesPerGroup,
    );
    const summaries = await Promise.all(
      groups.map(async (group) => {
        return this.summarizeUtility.generateTextSummary(group);
      }),
    );
    return groups.map((group, idx) => ({
      group,
      summary: summaries[idx].summary,
      error: summaries[idx]?.error,
    }));
  }
}
