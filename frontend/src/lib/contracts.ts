import { MarketFactoryABI } from "@/abis";
import { Market, MarketState, MarketStateExtended } from "./types";

export const marketFactory = {
  address: process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS as `0x${string}`,
  abi: MarketFactoryABI,
} as const;

export const getMarketStateData = (market: Market): MarketStateExtended => {
  const now = new Date();

  if (market.state === MarketState.Resolved) {
    return MarketStateExtended.Resolved;
  }

  if (
    market.state === MarketState.Closed &&
    market.closedAtTimeMs &&
    market.closedAtTimeMs + Number(market.resolveDelay * 1_000) <= now.getTime()
  ) {
    return MarketStateExtended.Resolvable;
  }

  if (
    market.state === MarketState.Closed &&
    market.closedAtTimeMs &&
    market.closedAtTimeMs + Number(market.resolveDelay * 1_000) > now.getTime()
  ) {
    return MarketStateExtended.Closed;
  }

  if (market.state == MarketState.Open && market.closeAt <= now) {
    return MarketStateExtended.Closable;
  }

  return MarketStateExtended.Open;
};
