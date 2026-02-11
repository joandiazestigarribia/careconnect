import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private messagesService: MessagesService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub?.toLowerCase();
      client.userRole = payload.role;

      client.join(`user:${client.userId}`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(client: AuthenticatedSocket, conversationId: string) {
    if (!client.userId) return;

    try {
      await this.messagesService.getConversation(client.userId, conversationId);
      client.join(`conversation:${conversationId}`);
      client.emit('joined', conversationId);
    } catch (error) {
      client.emit('error', 'Cannot join conversation');
    }
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(client: AuthenticatedSocket, conversationId: string) {
    client.leave(`conversation:${conversationId}`);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    client: AuthenticatedSocket,
    payload: { conversationId: string; content: string },
  ) {
    if (!client.userId) {
      client.emit('message_error', 'Not authenticated');
      return;
    }

    try {
      const message = await this.messagesService.sendMessage(client.userId, {
        conversation_id: payload.conversationId,
        content: payload.content,
      });

      const conversation = await this.messagesService.getConversation(
        client.userId,
        payload.conversationId,
      );

      const familyId = conversation.family_id?.toLowerCase();
      const caregiverId = conversation.caregiver_id?.toLowerCase();
      const senderId = client.userId?.toLowerCase();
      const otherUserId = familyId === senderId ? caregiverId : familyId;

      this.server
        .to(`conversation:${payload.conversationId}`)
        .emit('new_message', message);

      this.server.to(`user:${otherUserId}`).emit('new_message', message);

      client.emit('message_sent', message);
    } catch (error) {
      client.emit('message_error', error.message);
    }
  }

  @SubscribeMessage('typing')
  handleTyping(client: AuthenticatedSocket, data: { conversationId: string; isTyping: boolean }) {
    client
      .to(`conversation:${data.conversationId}`)
      .emit('typing', { userId: client.userId, isTyping: data.isTyping });
  }
}
