import { PublicClient, WalletClient } from 'viem';

export type TChainConfigValue = {
  envPrefix: string;
  rpcUrl: string;
  chainId: number;
  chainName: string;
};

export type ChainConfig = Record<string, TChainConfigValue>; // CHAIN_NAME => TChainConfigValue

export interface IChainContext extends TChainConfigValue {
  client: WalletClient & PublicClient;
}
