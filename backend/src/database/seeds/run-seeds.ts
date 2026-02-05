import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import { User, UserRole } from '../../users/entities/user.entity';
import { FamilyProfile } from '../../family-profiles/entities/family-profile.entity';
import { CaregiverProfile } from '../../caregiver-profiles/entities/caregiver-profile.entity';

const RESISTENCIA_COORDS = {
  center: { lat: -27.4511, lng: -58.9865 },
  families: [
    { name: 'Familia García', address: 'Av. 9 de Julio 1200, Resistencia, Chaco', lat: -27.4489, lng: -58.9851 },
    { name: 'Familia López', address: 'Calle French 800, Resistencia, Chaco', lat: -27.4523, lng: -58.9902 },
    { name: 'Familia Martínez', address: 'Av. Alvear 1500, Resistencia, Chaco', lat: -27.4556, lng: -58.9823 },
    { name: 'Familia Rodríguez', address: 'Calle Santa María 600, Resistencia, Chaco', lat: -27.4498, lng: -58.9945 },
    { name: 'Familia Fernández', address: 'Av. Chaco 2000, Resistencia, Chaco', lat: -27.4589, lng: -58.9789 },
  ],
  caregivers: [
    { first: 'María', last: 'González', lat: -27.4467, lng: -58.9878, rate: 2500 },
    { first: 'Ana', last: 'Silva', lat: -27.4534, lng: -58.9834, rate: 2200 },
    { first: 'Laura', last: 'Pérez', lat: -27.4512, lng: -58.9912, rate: 2800 },
    { first: 'Carmen', last: 'Ruiz', lat: -27.4478, lng: -58.9798, rate: 2000 },
    { first: 'Rosa', last: 'Torres', lat: -27.4567, lng: -58.9956, rate: 2600 },
    { first: 'Lucía', last: 'Ramírez', lat: -27.4445, lng: -58.9845, rate: 2300 },
    { first: 'Marta', last: 'Flores', lat: -27.4598, lng: -58.9889, rate: 2700 },
    { first: 'Elena', last: 'Sánchez', lat: -27.4423, lng: -58.9923, rate: 2100 },
    { first: 'Sofía', last: 'Morales', lat: -27.4545, lng: -58.9767, rate: 2400 },
    { first: 'Paula', last: 'Castro', lat: -27.4489, lng: -58.9945, rate: 2900 },
  ],
};

async function runSeeds() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🌱 Running seeds...');

  const userRepo = dataSource.getRepository(User);
  const familyRepo = dataSource.getRepository(FamilyProfile);
  const caregiverRepo = dataSource.getRepository(CaregiverProfile);

  console.log('🌱 Starting seed process...');
  
  
  await caregiverRepo.query('DELETE FROM caregiver_profiles');
  await familyRepo.query('DELETE FROM family_profiles');
  await userRepo.query('DELETE FROM users');

  const bcrypt = require('bcrypt');
  const password = await bcrypt.hash('Password123!', 10);

  for (let i = 0; i < RESISTENCIA_COORDS.families.length; i++) {
    const familyData = RESISTENCIA_COORDS.families[i];
    
    const user = await userRepo.save({
      email: `familia${i + 1}@test.com`,
      password,
      role: UserRole.FAMILY,
      phone: `+54911234567${i + 1}1`,
      verified: true,
      profile_completed: true,
    });

    await familyRepo.save({
      user_id: user.id,
      family_name: familyData.name,
      address: familyData.address,
      location: { type: 'Point', coordinates: [familyData.lng, familyData.lat] },
      children_count: Math.floor(Math.random() * 3) + 1,
      children_ages: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => Math.floor(Math.random() * 12) + 1),
      special_needs: Math.random() > 0.7 ? ['Alergia a maní'] : [],
      languages_preferred: ['Español'],
    });

    console.log(`✅ Created ${familyData.name}`);
  }

  const skills = [
    'Primeros auxilios',
    'Cocina',
    'Tareas escolares',
    'Actividades al aire libre',
    'Canto',
    'Juegos educativos',
  ];

  const languages = [['Español'], ['Español', 'Inglés'], ['Español', 'Portugués']];

  for (let i = 0; i < RESISTENCIA_COORDS.caregivers.length; i++) {
    const caregiverData = RESISTENCIA_COORDS.caregivers[i];
    
    const user = await userRepo.save({
      email: `cuidador${i + 1}@test.com`,
      password,
      role: UserRole.CAREGIVER,
      phone: `+54911234567${i + 1}9`,
      verified: true,
      profile_completed: true,
    });

    await caregiverRepo.save({
      user_id: user.id,
      first_name: caregiverData.first,
      last_name: caregiverData.last,
      bio: `Cuidadora con ${Math.floor(Math.random() * 10) + 2} años de experiencia. Me encanta trabajar con niños.`,
      location: { type: 'Point', coordinates: [caregiverData.lng, caregiverData.lat] },
      hourly_rate: caregiverData.rate,
      languages_spoken: languages[Math.floor(Math.random() * languages.length)],
      min_children_age: 0,
      max_children_age: 12,
      skills: skills.slice(0, Math.floor(Math.random() * 4) + 2),
      availability_radius_km: Math.floor(Math.random() * 10) + 5,
      trust_score: Math.floor(Math.random() * 30) + 70,
    });

    console.log(`✅ Created ${caregiverData.first} ${caregiverData.last}`);
  }

  console.log('✨ Seeds completed!');
  console.log('');
  console.log('📍 Test accounts:');
  console.log('   Families: familia1@test.com / Password123!');
  console.log('   Caregivers: cuidador1@test.com / Password123!');

  await app.close();
}

runSeeds().catch((error) => {
  console.error('❌ Seed error:', error);
  process.exit(1);
});
