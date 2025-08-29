import { Global, Module } from '@nestjs/common';

import { AIService } from './ai.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}
