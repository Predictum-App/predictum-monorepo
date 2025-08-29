import { Module } from '@nestjs/common';

import { MarketService } from './market.service';
import { MarketWeb3Service } from './market.web3.service';
import { MarketController } from './market.controller';

@Module({
  imports: [],
  controllers: [MarketController],
  providers: [MarketService, MarketWeb3Service],
})
export class MarketModule {}
