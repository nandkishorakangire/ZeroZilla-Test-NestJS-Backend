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
    text_groups: string[],
  ): Promise<{ result: { group: string; summary: string }[]; error?: any }> {
    return this.requestQueueService.addToQueue(async () => {
      try {
        const response = await firstValueFrom(
          this.httpService.post(
            this.GROQ_API_URL,
            {
              messages: [
                {
                  role: 'user',
                  content: `Task: Strictly produce exactly ${text_groups?.length || 0}, brief and non virtual context summary for each group in following array of length ${text_groups?.length || 0}.
Array: ${JSON.stringify(text_groups.map((group) => ({ group })))}
Then generate pure JSON output for below expected schema:
{result:[{group: "group number",summary: "summary of the group sentences in string"}]}`,
                },
              ],
              temperature: 0.3,
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
        // const parsedJSON = ((result) => {
        //   if (result.includes('{') && result.includes('}')) {
        //     result = result.substring(result.indexOf('{'));
        //     if (!result.endsWith('}')) {
        //       result = result.substring(0, result.lastIndexOf('}') + 1);
        //     }
        //   }
        //   return result;
        // })(response.data.choices[0].message.content);

        // return JSON.parse(JSON.parse(JSON.stringify(parsedJSON.replaceAll("\n","").replaceAll("\"\"", "\""))));
        const summaries = JSON.parse(
          response.data.choices[0].message.content,
        ).result;
        const data = {
          result: text_groups.map((g, i) => {
            return { group: g, summary: summaries[i].summary };
          }),
        };
        return data;
      } catch (error) {
        if (error?.response) {
          console.log(
            'response.data',
            JSON.stringify(error.response.data, undefined, 1),
          );
          return {
            error: {
              status: error.response.status,
              ...error.response.data.error,
            },
            result: [],
          };
        } else {
          return {
            result: [],
            error: {
              code: error?.code,
              status: error?.status,
              message: error.message,
            },
          };
        }
      }
    });
  }
}
