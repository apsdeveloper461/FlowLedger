import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ─── Cookie parser (for httpOnly auth cookies) ───────────────────────────
  app.use(cookieParser());

  // ─── Global validation pipe ──────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // strip unknown properties
      forbidNonWhitelisted: true,
      transform: true,        // auto-transform types (e.g. string → number for @Type)
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── CORS ────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // ─── Global prefix ───────────────────────────────────────────────────────
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 FlowLedger API running on http://localhost:${port}/api`);
}

bootstrap();
