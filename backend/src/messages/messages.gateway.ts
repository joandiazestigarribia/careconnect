import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import * as xss from 'xss';
import { MessagesService } from './messages.service';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  messageCount?: number;
  lastMessageTime?: number;
  joinCount?: number;
  lastJoinTime?: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
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

const sanitizeInput = (input: string): string => {
  return xss.filterXSS(input, {
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script'],
  });
};

const checkRateLimit = (
  client: AuthenticatedSocket,
  config: RateLimitConfig,
  countKey: 'messageCount' | 'joinCount',
  timeKey: 'lastMessageTime' | 'lastJoinTime',
): boolean => {
  const now = Date.now();
  const lastTime = client[timeKey] || 0;
  const count = client[countKey] || 0;

  if (now - lastTime > config.windowMs) {
    client[countKey] = 1;
    client[timeKey] = now;
    return true;
  }

  if (count >= config.maxRequests) {
    return false;
  }

  client[countKey] = count + 1;
  return true;
};

@WebSocketGateway({
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true,
  },
})
@UsePipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}))
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(MessagesGateway.name);
  
  private readonly messageRateLimit: RateLimitConfig = {
    maxRequests: 30, 
    windowMs: 60000, 
  };

  private readonly joinRateLimit: RateLimitConfig = {
    maxRequests: 10, 
    windowMs: 60000, 
  };

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
        client.emit('error', 'Authentication required');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub?.toLowerCase();
      client.userRole = payload.role;

      this.logger.log(`Client connected: ${client.id}, User: ${client.userId}`);
      
      client.join(`user:${client.userId}`);
      client.emit('connected', { userId: client.userId });
    } catch (error) {
      this.logger.error(`Client ${client.id} connection failed:`, error.message);
      client.emit('error', 'Invalid authentication');
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
      client.emit('error', 'Not authenticated');
      return;
    }

    if (!checkRateLimit(client, this.joinRateLimit, 'joinCount', 'lastJoinTime')) {
      this.logger.warn(`User ${client.userId} rate limited on join_conversation`);
      client.emit('error', 'Too many join attempts. Please slow down.');
      return;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(conversationId)) {
      this.logger.warn(`Client ${client.id} tried to join with invalid conversation ID`);
      client.emit('error', 'Invalid conversation ID');
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
    client.emit('left', conversationId);
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

    if (!checkRateLimit(client, this.messageRateLimit, 'messageCount', 'lastMessageTime')) {
      this.logger.warn(`User ${client.userId} rate limited on send_message`);
      client.emit('message_error', 'Too many messages. Please slow down.');
      return;
    }

    if (!payload || typeof payload !== 'object') {
      client.emit('message_error', 'Invalid message format');
      return;
    }

    if (!payload.conversationId || !payload.content) {
      client.emit('message_error', 'Missing conversationId or content');
      return;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(payload.conversationId)) {
      client.emit('message_error', 'Invalid conversation ID');
      return;
    }

    const content = payload.content.trim();
    if (content.length === 0) {
      client.emit('message_error', 'Message cannot be empty');
      return;
    }
    if (content.length > 2000) {
      client.emit('message_error', 'Message too long (max 2000 characters)');
      return;
    }

    try {
      const sanitizedContent = sanitizeInput(content);

      const message = await this.messagesService.sendMessage(client.userId, {
        conversation_id: payload.conversationId,
        content: sanitizedContent,
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
    if (!client.userId) return;
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!data?.conversationId || !uuidRegex.test(data.conversationId)) return;

    client
      .to(`conversation:${data.conversationId}`)
      .emit('typing', { userId: client.userId, isTyping: data.isTyping });
  }
}
