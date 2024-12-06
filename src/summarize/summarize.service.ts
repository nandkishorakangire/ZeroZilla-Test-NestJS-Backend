import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SummarizeService {
  private readonly GROQ_API_KEY = process.env.GROQ_API_KEY;
  private readonly GROQ_API_URL =
    'https://api.groq.com/openai/v1/chat/completions';

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
              {
                messages: [
                  {
                    role: 'user',
                    content: `Produce brief summary of the given sentences in json object structure as following:\n
                  {summary: "string"}\n
                  sentences: ${group}`,
                  },
                ],
                temperature: 0.7,
                max_tokens: 50,
                response_format: {
                  type: 'json_object',
                },
                model: 'llama3-8b-8192',
              },
              {
                headers: {
                  Authorization: `Bearer ${this.GROQ_API_KEY}`,
                  'Content-Type': 'application/json',
                },
              },
            ),
          );
          return JSON.parse(response.data.choices[0].message.content);
        } catch (error) {
          if (error?.response) {
            return {
              error: {
                status: error.response.status,
                data: error.response.data,
              },
              summary: '',
            };
          } else {
            return {
              summary: '',
              error: {
                status: error?.status || error?.code,
                data: { message: error.message },
              },
            };
          }
        }
      }),
    );
    return groups.map((group, idx) => ({
      group,
      summary: summaries[idx].summary,
      error: summaries[idx]?.error,
    }));
  }
}
