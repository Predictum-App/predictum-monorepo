import { Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { MarketService } from './market.service';
import { ChainContext } from '../common/decorators';
import { IChainContext } from '../common/types';

@ApiTags('Market')
@Controller('markets')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @ApiOperation({ summary: 'Resolves the market using AI' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @Post(':market')
  @HttpCode(HttpStatus.OK)
  resolveMarket(
    @ChainContext() chainContext: IChainContext,
    @Param('market') market: string,
  ) {
    return this.marketService.lockedResolveMarket(chainContext, market);
  }
}
