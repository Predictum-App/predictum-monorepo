import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PublicClient, BaseError } from 'viem';

import { IChainContext, TAIRequiredMarketData } from '@common/types';

import MarketABI from '@abis/market';
import CentralizedOracleABI from '@abis/centralizedOracle';

@Injectable()
export class MarketWeb3Service {
  private readonly logger = new Logger(MarketWeb3Service.name);

  public async getMarketEssentialData(
    client: PublicClient,
    marketAddress: string,
  ): Promise<TAIRequiredMarketData> {
    this.logger.log(`Getting market essential data: ${marketAddress}`);

    try {
      const marketContract = {
        address: marketAddress as `0x${string}`,
        abi: MarketABI,
      } as const;

      const marketInfo = await client.readContract({
        ...marketContract,
        functionName: 'getFullInfo',
      });

      return {
        question: marketInfo.question,
        askedAt: new Date(Number(marketInfo.createTime) * 1000),
        outcomes: marketInfo.outcomes as string[],
        closeTime: Number(marketInfo.closeTime),
        resolveDelay: Number(marketInfo.resolveDelay),
        state: Number(marketInfo.state),
        oracleAddress: marketInfo.oracle,
      };
    } catch (error) {
      this.logger.error(`Failed to get market data: `, error);
    }
  }

  public async tryCloseMarket(
    { client }: IChainContext,
    marketAddress: string,
    marketData: TAIRequiredMarketData,
  ) {
    this.logger.log(`Checking market ${marketAddress} state`);

    const marketContract = {
      address: marketAddress as `0x${string}`,
      abi: MarketABI,
    } as const;

    if (isNaN(marketData.state)) {
      throw new Error(
        `(BUG) Incorrect market state format: ${marketData.state}`,
      );
    }

    const now = new Date();
    const currentTime = Math.round(now.getTime() / 1000);

    if (marketData.state === 1) {
      if (marketData.closeTime + marketData.resolveDelay > currentTime) {
        const message = `Market ${marketAddress} already closed, but requires ${marketData.resolveDelay} seconds to resolve`;
        this.logger.error(message);
        throw new BadRequestException(message);
      } else {
        return;
      }
    }

    if (marketData.state === 2) {
      const message = `Market ${marketAddress} already resolved`;
      this.logger.error(message);
      throw new BadRequestException(message);
    }

    const shouldCloseAt = new Date(marketData.closeTime * 1000);

    if (marketData.closeTime > currentTime) {
      const message = `Market should be closed after ${shouldCloseAt.toISOString()}, current time ${now.toISOString()}`;
      this.logger.error(message);
      throw new BadRequestException(message);
    }

    this.logger.log(`Trying to close the market ${marketAddress}`);

    let success = false;
    try {
      const { request } = await client.simulateContract({
        ...marketContract,
        functionName: 'closeMarket',
      });
      const hash = await client.writeContract(request);
      await client.waitForTransactionReceipt({ hash });
      this.logger.log(`Market ${marketAddress} closed`);
      success = true;
    } catch (error) {
      if (error instanceof BaseError) {
        throw new Error(`Failed to close market: ${error.message}`);
      } else {
        throw new Error(`Failed to close market`, error);
      }
    }

    if (success) {
      const message = `Market ${marketAddress} is closed but requires ${marketData.resolveDelay} seconds resolve delay`;
      this.logger.error(message);
      throw new BadRequestException(message);
    }
  }

  public async checkOracleResolved(
    { client }: IChainContext,
    marketAddress: string,
    marketData: TAIRequiredMarketData,
  ) {
    this.logger.log(
      `Checking whether oracle for market ${marketAddress} is resolved`,
    );

    let isResolved: boolean = false;
    try {
      const oracleContract = {
        address: marketData.oracleAddress,
        abi: CentralizedOracleABI,
      } as const;

      isResolved = await client.readContract({
        ...oracleContract,
        functionName: 'isResolved',
      });
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to read Oracle state for market ${marketAddress}: ${error.message}`,
        );
      }
      if (error instanceof BaseError) {
        throw new Error(
          `Failed to read Oracle state for market ${marketAddress}: ${error.message}`,
        );
      } else {
        throw new Error(
          `Failed to read Oracle state for market ${marketAddress}`,
          error,
        );
      }
    }

    if (isResolved) {
      const message = `Outcome in oracle for market ${marketAddress} is already set`;
      this.logger.log(message);
    }

    return isResolved;
  }

  public async setOutcome(
    { client }: IChainContext,
    marketAddress: string,
    marketData: TAIRequiredMarketData,
    outcomeIndex: number,
  ) {
    this.logger.log(
      `Setting oracle outcome index ${outcomeIndex} for ${marketAddress} and Oracle ${marketData.oracleAddress}`,
    );

    try {
      const oracleContract = {
        address: marketData.oracleAddress,
        abi: CentralizedOracleABI,
      } as const;

      const { request } = await client.simulateContract({
        ...oracleContract,
        functionName: 'setOutcome',
        args: [BigInt(outcomeIndex.toString())],
      });
      const hash = await client.writeContract(request);
      await client.waitForTransactionReceipt({ hash });

      this.logger.log(`Outcome set in Oracle for ${marketAddress}`);
    } catch (error) {
      if (error instanceof BaseError) {
        throw new Error(
          `Failed to set outcome for market ${marketAddress} in oracle ${marketData.oracleAddress}: ${error.message}`,
        );
      } else {
        throw new Error(
          `Failed to set outcome for market ${marketAddress} in oracle ${marketData.oracleAddress}`,
          error,
        );
      }
    }
  }

  public async resolveMarket({ client }: IChainContext, marketAddress: string) {
    this.logger.log(`Resolving market ${marketAddress}`);

    try {
      const marketContract = {
        address: marketAddress as `0x${string}`,
        abi: MarketABI,
      } as const;

      const { request } = await client.simulateContract({
        ...marketContract,
        functionName: 'resolveMarket',
      });
      const hash = await client.writeContract(request);
      await client.waitForTransactionReceipt({ hash });
      this.logger.log(`Market ${marketAddress} resolved!`);
    } catch (error) {
      if (error instanceof BaseError) {
        throw new Error(
          `Failed to resolve market ${marketAddress}: ${error.message}`,
        );
      } else {
        throw new Error(`Failed to resolve market ${marketAddress}`, error);
      }
    }
  }
}
