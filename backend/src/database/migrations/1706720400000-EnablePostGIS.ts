import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnablePostGIS1706720400000 implements MigrationInterface {
  transaction = false;

  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);
      console.log('✅ PostGIS extension enabled');
    } catch (error) {
      console.warn('⚠️  PostGIS not available, skipping...');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.query(`DROP EXTENSION IF EXISTS postgis`);
    } catch (error) {
      console.warn('⚠️  Could not drop PostGIS, skipping...');
    }
  }
}