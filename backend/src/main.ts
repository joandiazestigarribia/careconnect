import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  logger.log('🚀 Starting CareConnect Backend...');
  logger.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  logger.log(`PORT: ${process.env.PORT || 3000}`);
  
  try {
    const app = await NestFactory.create(AppModule, {
      bufferLogs: true,
    });

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  app.use(cookieParser(process.env.COOKIE_SECRET));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());

  app.useGlobalFilters(new AllExceptionsFilter());

  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
  
  logger.log('Configured allowed origins:', allowedOrigins);
  
  app.enableCors({
    origin: (origin, callback) => {
      logger.log('CORS check - origin:', origin, 'allowed:', allowedOrigins);
      
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        logger.warn('CORS rejected for origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('CareConnect API')
    .setDescription('Caregiver marketplace API documentation')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  logger.log(`🚀 Application is running on: http://0.0.0.0:${port}`);
    logger.log(`📚 Swagger docs available at: http://0.0.0.0:${port}/api/docs`);
  } catch (error) {
    logger.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('❌ Unhandled error during bootstrap:', error);
  process.exit(1);
});
