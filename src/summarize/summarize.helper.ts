import { Injectable } from '@nestjs/common';

@Injectable()
export class SummarizeHelper {
  splitTextIntoGroups(text: string, sentencesPerGroup: number): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const groups = [];
    for (let i = 0; i < sentences.length; i += sentencesPerGroup) {
      groups.push(sentences.slice(i, i + sentencesPerGroup).join(' '));
    }
    return groups;
  }
}
