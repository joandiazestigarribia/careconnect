import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAvailabilitiesTable1706720400005 implements MigrationInterface {
  name = 'CreateAvailabilitiesTable1706720400005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE day_of_week_enum AS ENUM (
        'monday', 'tuesday', 'wednesday', 'thursday', 
        'friday', 'saturday', 'sunday'
      );
    `);

    await queryRunner.query(`
      CREATE TABLE availabilities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        caregiver_id UUID NOT NULL REFERENCES caregiver_profiles(user_id) ON DELETE CASCADE,
        day_of_week day_of_week_enum NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_recurring BOOLEAN DEFAULT true,
        specific_date DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_availabilities_caregiver_day ON availabilities(caregiver_id, day_of_week);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_availabilities_caregiver ON availabilities(caregiver_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_availabilities_caregiver`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_availabilities_caregiver_day`);
    await queryRunner.query(`DROP TABLE IF EXISTS availabilities`);
    await queryRunner.query(`DROP TYPE IF EXISTS day_of_week_enum`);
  }
}
