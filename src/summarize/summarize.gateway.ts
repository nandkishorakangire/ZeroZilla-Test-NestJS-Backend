import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SummarizeHelper } from './summarize.helper';
import { SummarizeUtility } from './summarize.utility';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: '*',
    allowedHeaders: '*',
  },
})
export class SummarizeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;

  constructor(
    private readonly summarizeHelper: SummarizeHelper,
    private readonly summarizeUtility: SummarizeUtility,
  ) {}

  private connectedClients: Map<string, Socket> = new Map();

  handleConnection(client: Socket) {
    // console.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);
  }

  handleDisconnect(client: Socket) {
    // console.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('summarize')
  async summarize(
    @MessageBody()
    data: {
      text: string;
      sentencesPerGroup: number;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { text, sentencesPerGroup } = data;
    try {
      const groups = this.summarizeHelper.splitTextIntoGroups(
        text,
        sentencesPerGroup,
      );
      for (const [idx, group] of groups.entries()) {
        if (!client.connected) {
          break;
        }
        const result = await this.summarizeUtility.generateTextSummary(group);
        client.emit('summary', {
          group,
          summary: result.summary,
          error: result?.error,
          offset: idx,
        });
      }
    } catch (error) {
      client.emit('error', { message: 'Failed to prefetch data', error });
    }
  }
}
