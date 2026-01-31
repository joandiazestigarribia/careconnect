import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1706720400001 implements MigrationInterface {
  name = 'CreateUsersTable1706720400001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE user_role_enum AS ENUM ('FAMILY', 'CAREGIVER', 'ADMIN');
    `);

    await queryRunner.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role user_role_enum DEFAULT 'FAMILY',
        phone VARCHAR(50),
        verified BOOLEAN DEFAULT FALSE,
        profile_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index on email for faster lookups
    await queryRunner.query(`
      CREATE INDEX idx_users_email ON users(email);
    `);

    console.log('✅ Users table created');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email`);
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_role_enum`);
  }
}
