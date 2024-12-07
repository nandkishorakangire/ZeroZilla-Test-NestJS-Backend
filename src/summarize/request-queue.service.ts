import { Injectable } from '@nestjs/common';

@Injectable()
export class RequestQueueService {
  private queue: (() => Promise<any>)[] = [];
  private isProcessing = false;
  private readonly rateLimitDelay = 2000; // 2 seconds per request

  addToQueue<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const task = async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      this.queue.push(task);
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        try {
          await task();
        } catch (error) {
          console.error('Request failed:', error);
        }
      }
      await new Promise((resolve) => setTimeout(resolve, this.rateLimitDelay));
    }

    this.isProcessing = false;
  }
}
