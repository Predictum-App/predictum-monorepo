export enum MarketState {
  Open = "Open",
  Closed = "Closed",
  Resolved = "Resolved",
}

export enum MarketStateExtended {
  Open = "Open",
  Closable = "Closable",
  Closed = "Closed",
  Resolvable = "Resolvable",
  Resolved = "Resolved",
}

export const parseMarketState = (num: number | string) => {
  switch (num) {
    case 0:
    case "0":
      return MarketState.Open;
    case 1:
    case "1":
      return MarketState.Closed;
    case 2:
    case "2":
      return MarketState.Resolved;
    default:
      console.log(`Unknown market state ${num}, fallback is resolved`);
      throw MarketState.Resolved;
  }
};

export interface MarketHourlyData {
  timestamp: number;
  timeString: string;
  [key: `outcome_${number}`]: number;
  tvlUSD: number;
  volumeUSD: number;
}

export interface Market {
  address: string;
  question: string;
  outcomes: string[];
  outcomePrice: number[];
  feeBPS: number;
  state: MarketState;
  creator: string;
  createTimeMs: number;
  closeTimeMs: number;
  closedAtTimeMs: number | null;
  createdAt: Date;
  closeAt: Date;
  closedAt: Date | null;
  volumeUSD: string;
  tvlUSD: string;
  timeProgressPercentage: number;
  resolveDelay: number;
  resolvedOutcomeIndex?: number;
  marketURI: string;
}

export interface Holder {
  address: string;
  outcomeIndex: number;
  shares: string;
}

export interface TopHoldersResult {
  outcome0: Holder[];
  outcome1: Holder[];
}
/* Search Params */
export type MarketDetailsSearchParams = {
  outcome: number;
};

export type CommonSearchParams = {
  addresses?: string[] | null;
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: string;
  filter?: string;
  page?: string;
  pageSize?: string;
  state?: MarketState;
};

/* Context types */
export type BalanceData = {
  usdAddress: `0x${string}`;
  usdBalance: bigint;
  isLoadingUSDCAddress: boolean;
  isLoadingBalance: boolean;
};

/* Action types */
export type CreateMarketData = {
  image?: File;
  question: string;
  outcomeNames: string[];
  initialLiquidity: string;
  closeDate: Date;
  resolveDelay: number;
  feeBPS: number;
  marketURI?: string;
};

export type BuySharesData = {
  address: `0x${string}`;
  outcomeIndex: number;
  amount: string;
};

export type SellSharesData = {
  address: `0x${string}`;
  outcomeIndex: number;
  shares: string;
};

export type ClaimRewardsData = {
  address: `0x${string}`;
};

export type AddLiquidityData = {
  address: `0x${string}`;
  amount: string;
};

export type RemoveLiquidityData = {
  address: `0x${string}`;
  shares: string;
};

export interface UserOutcome {
  id: string;
  index: number;
  shares: string;
  market: Market;
}

export interface TradingEvent {
  id: string;
  type: "buy" | "sell";
  market: { question: string; outcomes: string[] };
  outcomeIndex: number;
  amount: string;
  fee: string;
  shares: string;
  newOutcomePrice: string[];
  blockTimestamp: string;
}

export interface LiquidityEvent {
  id: string;
  type: "add" | "remove";
  market: { question: string };
  amount: string;
  liquidityShares?: string;
  shares?: string;
  outcomeSharesReturned: string[];
  blockTimestamp: string;
}

export interface UserProfile {
  id: string;
  marketDatas: Array<{
    id: string;
    feesClaimed: string;
    rewardsClaimed: string;
    liquidityShares: string;
    market: Market;
    outcomes: Array<{
      id: string;
      index: number;
      shares: string;
    }>;
  }>;
  sharesBoughtEvents: TradingEvent[];
  sharesSoldEvents: TradingEvent[];
  liquidityAddedEvents: LiquidityEvent[];
  liquidityRemovedEvents: LiquidityEvent[];
  feesClaimedEvents: Array<{
    amount: string;
  }>;
  rewardClaims: Array<{
    amount: string;
  }>;
}
