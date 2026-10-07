import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArcjetGuard } from './common/guards/arcjet.guard';
import { ArcjetModule } from './lib/arcjet/arcjet.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ArcjetModule],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ArcjetGuard }],
})
export class AppModule {}
