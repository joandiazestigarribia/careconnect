import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';

export default registerAs('database', () => {
  if (process.env.DATABASE_URL) {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: !isProduction,
      logging: process.env.NODE_ENV === 'development',
      migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
      migrationsRun: process.env.NODE_ENV !== 'production',
      ...(isProduction && {
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    };
  }

  const host = process.env.DB_HOST;
  const port = parseInt(process.env.DB_PORT || '5432');
  const username = process.env.DB_USERNAME;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  if (!host || !username || !password || !database) {
    throw new Error(
      'Database configuration incomplete. Provide either DATABASE_URL or DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME',
    );
  }

  const isProduction = process.env.NODE_ENV === 'production';

  return {
    type: 'postgres',
    host,
    port,
    username,
    password,
    database,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: !isProduction,
    logging: process.env.NODE_ENV === 'development',
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    migrationsRun: process.env.NODE_ENV !== 'production',
    ...(isProduction && {
      ssl: {
        rejectUnauthorized: false,
      },
    }),
  };
});

const getDataSourceOptions = (): DataSourceOptions => {
  if (process.env.DATABASE_URL) {
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
      migrationsTableName: 'migrations',
      ...(process.env.NODE_ENV === 'production' && {
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    } as DataSourceOptions;
  }

  return {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    migrationsTableName: 'migrations',
    ...(process.env.NODE_ENV === 'production' && {
      ssl: {
        rejectUnauthorized: false,
      },
    }),
  } as DataSourceOptions;
};

export const connectionSource = new DataSource(getDataSourceOptions());
