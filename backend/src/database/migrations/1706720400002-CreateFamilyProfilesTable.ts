import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFamilyProfilesTable1706720400002 implements MigrationInterface {
  name = 'CreateFamilyProfilesTable1706720400002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE family_profiles (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        family_name VARCHAR(255) NOT NULL,
        address VARCHAR(500) NOT NULL,
        location GEOGRAPHY(Point, 4326),
        children_count INT DEFAULT 1,
        children_ages TEXT,
        special_needs TEXT,
        languages_preferred TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_family_profiles_location ON family_profiles USING GIST (location);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_family_profiles_location`);
    await queryRunner.query(`DROP TABLE IF EXISTS family_profiles`);
  }
}
