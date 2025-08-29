import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  createWalletClient,
  extractChain,
  http,
  publicActions,
  PublicClient,
  WalletClient,
} from 'viem';
import { anvil, sei, seiDevnet, seiTestnet } from 'viem/chains';

import { ChainConfig, TChainConfigValue } from '@common/types';
import { privateKeyToAccount } from 'viem/accounts';

@Injectable()
export class Web3Service implements OnModuleInit {
  private readonly logger = new Logger(Web3Service.name);

  private walletClientInstances: Map<number, WalletClient> = new Map();

  public chainConfig: ChainConfig = {};
  public supportedChains = [seiTestnet, sei, seiDevnet, anvil];

  constructor(private config: ConfigService) {
    this.chainConfig = this.extractChainConfig();

    const WALLET_PRIVATE_KEY =
      this.config.getOrThrow<`0x${string}`>('WALLET_PRIVATE_KEY');
    const account = privateKeyToAccount(WALLET_PRIVATE_KEY);

    for (const value of Object.values(this.chainConfig)) {
      const chainSpecific_WALLET_PRIVATE_KEY = this.config.get<
        `0x${string}` | undefined
      >(`${value.envPrefix}_WALLET_PRIVATE_KEY`);

      const chain = extractChain({
        chains: this.supportedChains,
        // @ts-expect-error chainId's type is verified
        id: value.chainId,
      });
      const transport = http(value.rpcUrl);

      this.walletClientInstances[value.chainId] = createWalletClient({
        account: chainSpecific_WALLET_PRIVATE_KEY
          ? privateKeyToAccount(chainSpecific_WALLET_PRIVATE_KEY)
          : account,
        chain,
        transport,
      }).extend(publicActions);

      this.logger.log(
        `Wallet client for chain: ${value.chainName} initialized`,
      );
    }
  }

  async onModuleInit() {
    await this.validateChainConfig();
  }

  public getClientById(chainId: number): WalletClient & PublicClient {
    const client = this.walletClientInstances[chainId];
    if (!client) {
      throw new Error(`Unsupported Chain with ID: ${chainId}`);
    }
    return client;
  }

  private extractChainConfig(): ChainConfig {
    const chainConfig: ChainConfig = {};

    const envEntries = Object.entries(process.env);

    for (const [key, value] of envEntries) {
      if (key.endsWith('_CHAIN_NAME')) {
        const prefix = key.slice(0, -'_CHAIN_NAME'.length);

        const RPC_URL = process.env[`${prefix}_RPC_URL`];
        const CHAIN_ID = process.env[`${prefix}_CHAIN_ID`];

        if (!RPC_URL) {
          throw new Error(`Chain ${prefix} detected, but RPC URL is missing`);
        }

        const chainConfigValue: TChainConfigValue = {
          envPrefix: prefix,
          chainId: Number(CHAIN_ID),
          chainName: value,
          rpcUrl: RPC_URL,
        };

        const supportedIds: number[] = this.supportedChains.map((c) => c.id);
        if (!CHAIN_ID || isNaN(chainConfigValue.chainId)) {
          throw new Error(`Chain ${prefix} detected, but chain ID is missing`);
        }

        if (!supportedIds.includes(chainConfigValue.chainId)) {
          throw new Error(
            `Please validate the Chain ID, chain ID: ${chainConfigValue.chainId} or chain ${prefix} is not supported`,
          );
        }

        chainConfig[chainConfigValue.chainId] = chainConfigValue;
        this.logger.log(
          `Initialized chain ${value} with chain ID ${chainConfigValue.chainId} and RPC URL ${chainConfigValue.rpcUrl}`,
        );
      }
    }

    return chainConfig;
  }

  private async validateChainConfig() {
    for (const value of Object.values(this.chainConfig)) {
      await this.validateChainId(value.chainId);
    }
  }

  private async validateChainId(chainId: number) {
    const client = this.getClientById(chainId);
    try {
      const actualChainId = await client.getChainId();
      if (actualChainId !== chainId) {
        throw new Error(
          `Chain ID mismatch for chain ${chainId}. Expected ${actualChainId} from the network, but got ${chainId} from the configuration`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to validate chain ID for chain ${chainId}`,
        error,
      );
      throw error;
    }
  }
}
