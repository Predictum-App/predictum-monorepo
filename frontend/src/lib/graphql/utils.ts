import { ApolloQueryResult } from "@apollo/client";
import { format } from "date-fns";
import { parseUnits } from "viem";

import {
  Holder,
  Market,
  MarketHourlyData,
  MarketState,
  parseMarketState,
  UserOutcome,
  TradingEvent,
  LiquidityEvent,
} from "../types";
import { formatAmountWithRegex, getTimeProgress } from "../utils";
import { resolveImageFromURI } from "../pinata";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleErrors = (result: ApolloQueryResult<any>) => {
  if (result.errors) {
    for (const error of Object.values(result.errors)) {
      console.log(error.message);
    }
  }

  if (result.error) {
    console.log(result.error.stack || result.error.message);
  }
};

export const parseGraphQLMarket = (m: {
  __typename?: "Market";
  closeTime: string;
  closedAtTime: string;
  createTime: string;
  creator: string;
  feeBPS: string;
  id: string;
  outcomeCount: string;
  outcomes: Array<string>;
  outcomesPrice: Array<string>;
  question: string;
  tvlUSD: string;
  volumeUSD: string;
  resolveDelay: string;
  state?: string;
  resolvedOutcome?: string | null;
  marketURI: string;
}): Market => {
  const createTimeMs = Number(m.createTime) * 1000;
  const closeTimeMs = Number(m.closeTime) * 1000;
  const closedAtTimeMs = m.closedAtTime ? Number(m.closedAtTime) * 1000 : null;

  let outcomePrice: number[];
  if (!m.outcomesPrice || m.outcomesPrice.length === 0) {
    outcomePrice = [0, 0];
  } else {
    const outcome1 = parseUnits("1", 6) - BigInt(m.outcomesPrice[0]);
    outcomePrice = [m.outcomesPrice[0], outcome1].map((p) =>
      Number(formatAmountWithRegex(BigInt(p), 6, 4, false)),
    );
  }

  return {
    address: m.id,
    question: m.question,
    outcomes: m.outcomes || [],
    outcomePrice,
    feeBPS: Number(m.feeBPS),
    state: m.state ? parseMarketState(m.state) : MarketState.Open,
    creator: m.creator,
    createTimeMs: createTimeMs,
    closeTimeMs: closeTimeMs,
    closedAtTimeMs,
    createdAt: new Date(createTimeMs),
    closeAt: new Date(closeTimeMs),
    closedAt: closedAtTimeMs ? new Date(closedAtTimeMs) : null,
    volumeUSD: formatAmountWithRegex(BigInt(m.volumeUSD || "0"), 6, 0, false),
    tvlUSD: formatAmountWithRegex(BigInt(m.tvlUSD || "0"), 6, 0, false),
    timeProgressPercentage: Math.round(getTimeProgress(createTimeMs, closeTimeMs, Date.now())),
    resolveDelay: Number(m.resolveDelay),
    resolvedOutcomeIndex:
      typeof m.resolvedOutcome === "string" ? Number(m.resolvedOutcome) : undefined,
    marketURI: resolveImageFromURI(m.marketURI) || "",
  };
};

export const parseGraphQlMarketHourData = (
  m: {
    __typename?: "MarketHourData";
    hourStartUnix: number;
    hourlyTvlUSD: string;
    hourlyVolumeUSD: string;
    marketOutcomePrices: Array<{
      __typename?: "MarketHourOutcome";
      index: string;
      price: string;
    }>;
  },
  hours: number,
): MarketHourlyData => {
  const timeFormat = hours > 24 ? "MM MMMM, HH:mm" : "HH:mm";
  const data: MarketHourlyData = {
    timestamp: m.hourStartUnix,
    timeString: format(new Date(m.hourStartUnix * 1000), timeFormat),
    volumeUSD: Number(formatAmountWithRegex(BigInt(m.hourlyVolumeUSD || "0"), 6, 0, false)),
    tvlUSD: Number(formatAmountWithRegex(BigInt(m.hourlyTvlUSD || "0"), 6, 0, false)),
  };

  // Add safety checks for marketOutcomePrices array
  if (!m.marketOutcomePrices || m.marketOutcomePrices.length === 0) {
    throw new Error("Market hour data has no outcome prices");
  }

  const outcome1 = parseUnits("1", 6) - BigInt(m.marketOutcomePrices[0].price);

  data[`outcome_0`] = Number(
    formatAmountWithRegex(BigInt(m.marketOutcomePrices[0].price), 6, 4, false),
  );
  data[`outcome_1`] = Number(formatAmountWithRegex(BigInt(outcome1), 6, 4, false));

  return data;
};

export const parseGraphQlHolders = (u: {
  __typename?: "UserOutcome";
  index: string;
  shares: string;
  user: {
    __typename?: "User";
    id: string;
  };
}): Holder => {
  return {
    address: u.user.id,
    outcomeIndex: Number(u.index),
    shares: formatAmountWithRegex(BigInt(u.shares || "0"), 6, 2, true),
  };
};

export const parseGraphQLUserOutcome = (u: {
  __typename?: "UserOutcome";
  id: string;
  index: string;
  shares: string;
  market: {
    __typename?: "Market";
    closeTime: string;
    closedAtTime: string;
    createTime: string;
    creator: string;
    feeBPS: string;
    id: string;
    outcomeCount: string;
    outcomes: Array<string>;
    outcomesPrice: Array<string>;
    question: string;
    tvlUSD: string;
    volumeUSD: string;
    resolveDelay: string;
    state?: string;
    resolvedOutcome?: string | null;
    marketURI: string;
  };
}): UserOutcome => {
  // Validate required fields
  if (!u.market) {
    throw new Error(`User outcome ${u.id} is missing market data`);
  }

  return {
    id: u.id,
    index: Number(u.index),
    shares: formatAmountWithRegex(BigInt(u.shares || "0"), 6, 2, true),
    market: parseGraphQLMarket(u.market),
  };
};

export const parseGraphQLTradingEvent = (
  event: {
    id: string;
    outcomeIndex: string;
    amount: string;
    fee: string;
    shares: string;
    newOutcomePrice: Array<string>;
    blockTimestamp: string;
    market: {
      outcomes: Array<string>;
      question: string;
    };
  },
  type: "buy" | "sell",
): TradingEvent => {
  // Validate required fields
  if (!event.market) {
    throw new Error(`Trading event ${event.id} is missing market data`);
  }

  return {
    id: event.id,
    type,
    market: { question: event.market.question, outcomes: event.market.outcomes },
    outcomeIndex: Number(event.outcomeIndex),
    amount: formatAmountWithRegex(BigInt(event.amount || "0"), 6, 2, false),
    fee: formatAmountWithRegex(BigInt(event.fee || "0"), 6, 2, false),
    shares: formatAmountWithRegex(BigInt(event.shares || "0"), 6, 2, true),
    newOutcomePrice: (event.newOutcomePrice || []).map((price: string) =>
      formatAmountWithRegex(BigInt(price || "0"), 6, 4, false),
    ),
    blockTimestamp: event.blockTimestamp,
  };
};

export const parseGraphQLLiquidityEvent = (
  event: {
    id: string;
    amount: string;
    liquidityShares?: string;
    outcomeSharesReturned: Array<string>;
    blockTimestamp: string;
    market: {
      question: string;
    };
  },
  type: "add" | "remove",
): LiquidityEvent => {
  return {
    id: event.id,
    type,
    market: { question: event.market.question },
    amount: formatAmountWithRegex(BigInt(event.amount || "0"), 6, 2, false),
    liquidityShares: event.liquidityShares
      ? formatAmountWithRegex(BigInt(event.liquidityShares), 6, 2, true)
      : undefined,
    outcomeSharesReturned: (event.outcomeSharesReturned || []).map((shares: string) =>
      formatAmountWithRegex(BigInt(shares || "0"), 6, 2, true),
    ),
    blockTimestamp: event.blockTimestamp,
  };
};
