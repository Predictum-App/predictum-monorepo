import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { IChainContext } from '@common/types';

import { AIService } from '../AI';

import { MarketWeb3Service } from './market.web3.service';

@Injectable()
export class MarketService {
  private readonly logger = new Logger(MarketService.name);

  private resolveState: Record<string, Date | null> = {};

  constructor(
    private ai: AIService,
    private readonly marketWeb3: MarketWeb3Service,
  ) {}

  async resolveMarket(chainContext: IChainContext, marketAddress: string) {
    this.logger.log(`Received request for resolving market: ${marketAddress}`);

    const marketData = await this.marketWeb3.getMarketEssentialData(
      chainContext.client,
      marketAddress,
    );

    if (marketData.state === 2) {
      throw new BadRequestException(
        `Market ${marketAddress} is already resolved`,
      );
    }

    await this.marketWeb3.tryCloseMarket(
      chainContext,
      marketAddress,
      marketData,
    );

    const isResolved = await this.marketWeb3.checkOracleResolved(
      chainContext,
      marketAddress,
      marketData,
    );

    if (!isResolved) {
      const data = await this.ai.askAIResolver(marketData);

      if (!data) {
        return;
      }

      if (data.voided) {
        // Increase counter until void
        this.logger.log('AI is unable to select outcome');
        return;
      }

      await this.marketWeb3.setOutcome(
        chainContext,
        marketAddress,
        marketData,
        data.outcomeIndex,
      );
    }

    await this.marketWeb3.resolveMarket(chainContext, marketAddress);

    return true;
  }

  async lockedResolveMarket(
    chainContext: IChainContext,
    marketAddress: string,
  ) {
    try {
      console.log(this.resolveState[marketAddress]);

      if (
        this.resolveState[marketAddress] &&
        Date.now() - this.resolveState[marketAddress].getTime() > 60 * 1_000
      ) {
        this.resolveState[marketAddress] = null;
      }

      if (this.resolveState[marketAddress]) {
        const message = `Currently resolving market ${marketAddress}, please try again later`;
        this.logger.warn(message);
        throw new BadRequestException(message);
      } else {
        this.resolveState[marketAddress] = new Date();
      }

      return await this.resolveMarket(chainContext, marketAddress);
    } catch (error) {
      this.resolveState[marketAddress] = null;
      throw error;
    }
  }
}
