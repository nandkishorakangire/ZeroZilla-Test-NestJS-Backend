import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SummarizeService {
  private readonly GROQ_API_KEY = process.env.GROQ_API_KEY;
  private readonly GROQ_API_URL = 'https://console.groq.com/playground';

  constructor(private readonly httpService: HttpService) {}

  private splitTextIntoGroups(
    text: string,
    sentencesPerGroup: number,
  ): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const groups = [];
    for (let i = 0; i < sentences.length; i += sentencesPerGroup) {
      groups.push(sentences.slice(i, i + sentencesPerGroup).join(' '));
    }
    return groups;
  }

  async summarize(text: string, sentencesPerGroup: number): Promise<any[]> {
    const groups = this.splitTextIntoGroups(text, sentencesPerGroup);
    const summaries = await Promise.all(
      groups.map(async (group) => {
        try {
          const response = await firstValueFrom(
            this.httpService.post(
              this.GROQ_API_URL,
              { prompt: group, temperature: 0.7, max_tokens: 50 },
              {
                headers: {
                  Authorization: `Bearer ${this.GROQ_API_KEY}`,
                  'Content-Type': 'application/json',
                },
              },
            ),
          );
          return response.data;
        } catch (error) {
          if (error?.response) {
            return {
              error: {
                status: error.response.status,
                data: error.response.data,
              },
            };
          } else {
            console.log('Error:', error);
            return [];
          }
        }
      }),
    );
    return groups.map((group, idx) => ({
      group,
      summary: summaries[idx],
    }));
  }
}
