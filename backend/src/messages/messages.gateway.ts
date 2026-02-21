import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

const parseCookies = (cookieHeader: string | undefined): Record<string, string> => {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=');
    if (name && rest.length > 0) {
      cookies[name] = decodeURIComponent(rest.join('='));
    }
  });
  return cookies;
};

@WebSocketGateway({
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true,
  },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(MessagesGateway.name);
  
  @WebSocketServer()
  server: Server;

  constructor(
    private messagesService: MessagesService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      this.logger.debug(`Client attempting connection: ${client.id}`);
      
      const cookies = parseCookies(client.handshake.headers.cookie);
      const token = cookies['access_token'] || client.handshake.auth.token;
      
      if (!token) {
        this.logger.warn(`Client ${client.id} disconnected: No token provided`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub?.toLowerCase();
      client.userRole = payload.role;

      this.logger.log(`Client connected: ${client.id}, User: ${client.userId}`);
      
      client.join(`user:${client.userId}`);
    } catch (error) {
      this.logger.error(`Client ${client.id} connection failed:`, error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}, User: ${client.userId}`);
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(client: AuthenticatedSocket, conversationId: string) {
    if (!client.userId) {
      this.logger.warn(`Client ${client.id} tried to join conversation without auth`);
      return;
    }

    try {
      this.logger.debug(`User ${client.userId} joining conversation ${conversationId}`);
      await this.messagesService.getConversation(client.userId, conversationId);
      client.join(`conversation:${conversationId}`);
      client.emit('joined', conversationId);
      this.logger.debug(`User ${client.userId} joined conversation ${conversationId}`);
    } catch (error) {
      this.logger.error(`User ${client.userId} failed to join conversation ${conversationId}:`, error.message);
      client.emit('error', 'Cannot join conversation');
    }
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(client: AuthenticatedSocket, conversationId: string) {
    this.logger.debug(`User ${client.userId} leaving conversation ${conversationId}`);
    client.leave(`conversation:${conversationId}`);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    client: AuthenticatedSocket,
    payload: { conversationId: string; content: string },
  ) {
    this.logger.debug(`Received send_message from ${client.userId}:`, payload);
    
    if (!client.userId) {
      this.logger.warn(`Client ${client.id} tried to send message without auth`);
      client.emit('message_error', 'Not authenticated');
      return;
    }

    try {
      const message = await this.messagesService.sendMessage(client.userId, {
        conversation_id: payload.conversationId,
        content: payload.content,
      });

      this.logger.log(`Message saved: ${message.id} in conversation ${payload.conversationId}`);

      const conversation = await this.messagesService.getConversation(
        client.userId,
        payload.conversationId,
      );

      const familyId = conversation.family_id?.toLowerCase();
      const caregiverId = conversation.caregiver_id?.toLowerCase();
      const senderId = client.userId?.toLowerCase();
      const otherUserId = familyId === senderId ? caregiverId : familyId;

      this.logger.debug(`Emitting new_message to conversation:${payload.conversationId} and user:${otherUserId}`);

      this.server
        .to(`conversation:${payload.conversationId}`)
        .emit('new_message', message);

      this.server.to(`user:${otherUserId}`).emit('new_message', message);

      client.emit('message_sent', message);
      
      this.logger.debug(`Message ${message.id} emitted successfully`);
    } catch (error) {
      this.logger.error(`Failed to send message:`, error.message);
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
