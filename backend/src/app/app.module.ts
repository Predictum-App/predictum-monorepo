import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { Web3Module } from '../web3';
import { MarketModule } from '../market';
import { AIModule } from '../AI';

import { AppController } from './app.controller';

import { AppService } from './app.service';

import { validate } from '../env.validation';

import { ChainContextInterceptor } from '@interceptors';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available globally
      validate,
    }),
    Web3Module,
    AIModule,
    MarketModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ChainContextInterceptor,
    },
  ],
})
export class AppModule {}
