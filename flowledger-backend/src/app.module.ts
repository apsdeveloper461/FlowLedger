import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { join } from 'path';

import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import mailConfig from './config/mail.config';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { SpendTagsModule } from './spend-tags/spend-tags.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AnalyticsModule } from './analytics/analytics.module';

import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';

@Module({
  imports: [
    // ─── Global config ────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, mailConfig],
      envFilePath: '.env',
    }),

    // ─── Database ────────────────────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.database'),
        entities: [join(__dirname, '**', '*.entity{.ts,.js}')],
        migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
        synchronize: false,
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),

    // ─── Feature modules ─────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    WalletsModule,
    SpendTagsModule,
    TransactionsModule,
    AnalyticsModule,
  ],
  providers: [
    // Apply JWT guard globally — routes opt-out with @Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Global exception filter
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    // Global response envelope
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
  ],
})
export class AppModule {}
