import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAddressToCaregiverProfiles1706720400004 implements MigrationInterface {
  name = 'AddAddressToCaregiverProfiles1706720400004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE caregiver_profiles 
      ADD COLUMN address VARCHAR(500);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE caregiver_profiles 
      DROP COLUMN address;
    `);
  }
}
