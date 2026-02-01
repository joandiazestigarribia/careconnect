import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCaregiverProfilesTable1706720400003 implements MigrationInterface {
  name = 'CreateCaregiverProfilesTable1706720400003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE caregiver_profiles (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        bio TEXT,
        location GEOGRAPHY(Point, 4326),
        hourly_rate DECIMAL(10, 2) NOT NULL,
        languages_spoken TEXT NOT NULL,
        min_children_age INT NOT NULL,
        max_children_age INT NOT NULL,
        skills TEXT,
        availability_radius_km INT DEFAULT 5,
        response_time_avg INT,
        trust_score DECIMAL(5, 2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_caregiver_profiles_location ON caregiver_profiles USING GIST (location);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_caregiver_profiles_trust_score ON caregiver_profiles(trust_score DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_caregiver_profiles_trust_score`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_caregiver_profiles_location`);
    await queryRunner.query(`DROP TABLE IF EXISTS caregiver_profiles`);
  }
}
