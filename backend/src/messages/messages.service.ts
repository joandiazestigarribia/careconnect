import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message, MessageStatus } from './entities/message.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async createConversation(familyId: string, dto: CreateConversationDto): Promise<Conversation> {
    const existing = await this.conversationRepository.findOne({
      where: { family_id: familyId, caregiver_id: dto.caregiver_id },
    });

    if (existing) {
      return existing;
    }

    const conversation = this.conversationRepository.create({
      family_id: familyId,
      caregiver_id: dto.caregiver_id,
    });

    return this.conversationRepository.save(conversation);
  }

  async getMyConversations(userId: string, userRole: 'FAMILY' | 'CAREGIVER'): Promise<Conversation[]> {
    const where = userRole === 'FAMILY' 
      ? { family_id: userId }
      : { caregiver_id: userId };

    return this.conversationRepository.find({
      where,
      relations: ['family', 'caregiver', 'last_message'],
      order: { updated_at: 'DESC' },
    });
  }

  async getConversation(userId: string, conversationId: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['family', 'caregiver'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.family_id !== userId && conversation.caregiver_id !== userId) {
      throw new ForbiddenException('You are not part of this conversation');
    }

    return conversation;
  }

  async getMessages(conversationId: string, userId: string, limit = 50, offset = 0): Promise<Message[]> {
    const conversation = await this.getConversation(userId, conversationId);
    
    return this.messageRepository.find({
      where: { conversation_id: conversationId },
      relations: ['sender'],
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async sendMessage(senderId: string, dto: CreateMessageDto): Promise<Message> {
    const normalizedSenderId = senderId?.toLowerCase();
    const conversation = await this.getConversation(normalizedSenderId, dto.conversation_id);

    const message = this.messageRepository.create({
      conversation_id: dto.conversation_id,
      sender_id: normalizedSenderId,
      content: dto.content,
      status: MessageStatus.SENT,
    });

    const savedMessage = await this.messageRepository.save(message);

    conversation.last_message_id = savedMessage.id;
    
    const familyId = conversation.family_id?.toLowerCase();
    if (familyId === normalizedSenderId) {
      conversation.unread_caregiver_count += 1;
    } else {
      conversation.unread_family_count += 1;
    }

    await this.conversationRepository.save(conversation);

    return this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender'],
    }) as Promise<Message>;
  }

  async markAsRead(userId: string, conversationId: string): Promise<void> {
    const conversation = await this.getConversation(userId, conversationId);

    if (conversation.family_id === userId) {
      conversation.unread_family_count = 0;
    } else {
      conversation.unread_caregiver_count = 0;
    }

    await this.conversationRepository.save(conversation);

    await this.messageRepository.update(
      {
        conversation_id: conversationId,
        sender_id: userId === conversation.family_id ? conversation.caregiver_id : conversation.family_id,
        status: MessageStatus.SENT,
      },
      {
        status: MessageStatus.READ,
        read_at: new Date(),
      },
    );
  }

  async getUnreadCount(userId: string, userRole: 'FAMILY' | 'CAREGIVER'): Promise<number> {
    const field = userRole === 'FAMILY' ? 'unread_family_count' : 'unread_caregiver_count';
    const idField = userRole === 'FAMILY' ? 'family_id' : 'caregiver_id';

    const result = await this.conversationRepository
      .createQueryBuilder('conversation')
      .select(`SUM(conversation.${field})`, 'total')
      .where(`conversation.${idField} = :userId`, { userId })
      .getRawOne();

    return parseInt(result?.total || '0', 10);
  }
}
