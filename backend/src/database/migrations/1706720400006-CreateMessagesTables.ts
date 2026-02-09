import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMessagesTables1706720400006 implements MigrationInterface {
  name = 'CreateMessagesTables1706720400006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create message status enum
    await queryRunner.query(`
      CREATE TYPE message_status_enum AS ENUM ('sent', 'delivered', 'read');
    `);

    // Create conversations table
    await queryRunner.query(`
      CREATE TABLE conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        family_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        caregiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        last_message_id UUID REFERENCES messages(id),
        unread_family_count INT DEFAULT 0,
        unread_caregiver_count INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(family_id, caregiver_id)
      );
    `);

    // Create messages table
    await queryRunner.query(`
      CREATE TABLE messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        status message_status_enum DEFAULT 'sent',
        read_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX idx_conversations_family ON conversations(family_id);
    `);
    await queryRunner.query(`
      CREATE INDEX idx_conversations_caregiver ON conversations(caregiver_id);
    `);
    await queryRunner.query(`
      CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);
    `);
    await queryRunner.query(`
      CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
    `);
    await queryRunner.query(`
      CREATE INDEX idx_messages_sender ON messages(sender_id);
    `);

    // Add foreign key for last_message_id (after messages table exists)
    await queryRunner.query(`
      ALTER TABLE conversations 
      ADD CONSTRAINT fk_conversations_last_message 
      FOREIGN KEY (last_message_id) REFERENCES messages(id) ON DELETE SET NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_messages_sender`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_messages_conversation`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_conversations_updated`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_conversations_caregiver`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_conversations_family`);
    await queryRunner.query(`DROP TABLE IF EXISTS messages`);
    await queryRunner.query(`DROP TABLE IF EXISTS conversations`);
    await queryRunner.query(`DROP TYPE IF EXISTS message_status_enum`);
  }
}
