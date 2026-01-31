import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import { User, UserRole } from '../../users/entities/user.entity';

async function runSeeds() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🌱 Running seeds...');

  // Create test users
  const userRepository = dataSource.getRepository(User);

  // Check if users already exist
  const existingCount = await userRepository.count();
  if (existingCount > 0) {
    console.log(`⚠️  ${existingCount} users already exist. Skipping user seeds.`);
  } else {
    // Create test families
    const families = [
      {
        email: 'familia1@test.com',
        password: 'password123',
        role: UserRole.FAMILY,
        phone: '+5491123456781',
      },
      {
        email: 'familia2@test.com',
        password: 'password123',
        role: UserRole.FAMILY,
        phone: '+5491123456782',
      },
      {
        email: 'familia3@test.com',
        password: 'password123',
        role: UserRole.FAMILY,
        phone: '+5491123456783',
      },
      {
        email: 'familia4@test.com',
        password: 'password123',
        role: UserRole.FAMILY,
        phone: '+5491123456784',
      },
      {
        email: 'familia5@test.com',
        password: 'password123',
        role: UserRole.FAMILY,
        phone: '+5491123456785',
      },
    ];

    // Create test caregivers
    const caregivers = [
      {
        email: 'cuidador1@test.com',
        password: 'password123',
        role: UserRole.CAREGIVER,
        phone: '+5491123456791',
      },
      {
        email: 'cuidador2@test.com',
        password: 'password123',
        role: UserRole.CAREGIVER,
        phone: '+5491123456792',
      },
      {
        email: 'cuidador3@test.com',
        password: 'password123',
        role: UserRole.CAREGIVER,
        phone: '+5491123456793',
      },
      {
        email: 'cuidador4@test.com',
        password: 'password123',
        role: UserRole.CAREGIVER,
        phone: '+5491123456794',
      },
      {
        email: 'cuidador5@test.com',
        password: 'password123',
        role: UserRole.CAREGIVER,
        phone: '+5491123456795',
      },
      {
        email: 'cuidador6@test.com',
        password: 'password123',
        role: UserRole.CAREGIVER,
        phone: '+5491123456796',
      },
      {
        email: 'cuidador7@test.com',
        password: 'password123',
        role: UserRole.CAREGIVER,
        phone: '+5491123456797',
      },
      {
        email: 'cuidador8@test.com',
        password: 'password123',
        role: UserRole.CAREGIVER,
        phone: '+5491123456798',
      },
      {
        email: 'cuidador9@test.com',
        password: 'password123',
        role: UserRole.CAREGIVER,
        phone: '+5491123456799',
      },
      {
        email: 'cuidador10@test.com',
        password: 'password123',
        role: UserRole.CAREGIVER,
        phone: '+5491123456710',
      },
    ];

    const bcrypt = require('bcrypt');

    for (const family of families) {
      const hashedPassword = await bcrypt.hash(family.password, 10);
      await userRepository.save({
        ...family,
        password: hashedPassword,
        verified: true,
      });
    }
    console.log(`✅ Created ${families.length} test families`);

    for (const caregiver of caregivers) {
      const hashedPassword = await bcrypt.hash(caregiver.password, 10);
      await userRepository.save({
        ...caregiver,
        password: hashedPassword,
        verified: true,
      });
    }
    console.log(`✅ Created ${caregivers.length} test caregivers`);
  }

  console.log('✨ Seeds completed!');
  await app.close();
}

runSeeds().catch((error) => {
  console.error('❌ Seed error:', error);
  process.exit(1);
});
