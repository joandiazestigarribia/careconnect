import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

@ApiTags('Messages')
@Controller('messages')
@SkipThrottle() 
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('conversations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createConversation(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
    @Body() dto: CreateConversationDto,
  ) {
    if (userRole !== 'FAMILY') {
      throw new Error('Only families can initiate conversations');
    }
    return this.messagesService.createConversation(userId, dto);
  }

  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMyConversations(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.messagesService.getMyConversations(userId, userRole as 'FAMILY' | 'CAREGIVER');
  }

  @Get('conversations/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getConversation(
    @CurrentUser('id') userId: string,
    @Param('id') conversationId: string,
  ) {
    return this.messagesService.getConversation(userId, conversationId);
  }

  @Get('conversations/:id/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 120, ttl: 60000 } }) 
  getMessages(
    @CurrentUser('id') userId: string,
    @Param('id') conversationId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ) {
    return this.messagesService.getMessages(conversationId, userId, limit, offset);
  }

  @Post('messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  sendMessage(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.messagesService.sendMessage(userId, dto);
  }

  @Post('conversations/:id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  markAsRead(
    @CurrentUser('id') userId: string,
    @Param('id') conversationId: string,
  ) {
    return this.messagesService.markAsRead(userId, conversationId);
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getUnreadCount(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    const normalizedUserId = userId?.toLowerCase();
    return this.messagesService.getUnreadCount(normalizedUserId, userRole as 'FAMILY' | 'CAREGIVER');
  }
}
