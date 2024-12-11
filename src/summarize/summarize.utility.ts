import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { RequestQueueService } from './request-queue.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SummarizeUtility {
  private readonly GROQ_API_KEY = process.env.GROQ_API_KEY;
  private readonly GROQ_API_URL =
    'https://api.groq.com/openai/v1/chat/completions';

  constructor(
    private readonly httpService: HttpService,
    private readonly requestQueueService: RequestQueueService,
  ) {}

  async generateTextSummary(
    text: string,
  ): Promise<{ summary: string; error?: any }> {
    return this.requestQueueService.addToQueue(async () => {
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
                  sentences: ${text}`,
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
    });
  }
}
