"use server";

import { Market_OrderBy, OrderDirection } from "@/__generated__/graphql";
import createApolloClient, {
  GET_CHART_DATA,
  GET_CLOSED_MARKETS,
  GET_FAVORITE_MARKETS,
  GET_FEATURED_MARKETS,
  GET_MARKET,
  GET_MARKETS,
  GET_TOP_HOLDERS_0,
  GET_TOP_HOLDERS_1,
  GET_USER_PROFILE,
  GET_USER_CREATED_MARKETS,
  GET_USER_SHARES,
} from "./graphql";
import {
  handleErrors,
  parseGraphQlHolders,
  parseGraphQLLiquidityEvent,
  parseGraphQLMarket,
  parseGraphQlMarketHourData,
  parseGraphQLTradingEvent,
  parseGraphQLUserOutcome,
} from "./graphql/utils";
import {
  CommonSearchParams,
  Market,
  MarketHourlyData,
  MarketState,
  TopHoldersResult,
  UserProfile,
  UserOutcome,
} from "./types";
import { isInEnum } from "./utils";
import { getUnixTime } from "date-fns";

export const getFeatuedMarkets = async (): Promise<Market[]> => {
  try {
    const client = createApolloClient();

    const result = await client.query({ query: GET_FEATURED_MARKETS });
    handleErrors(result);

    return (
      result?.data?.markets?.map<Market>((m) => ({
        ...parseGraphQLMarket(m),
        state: MarketState.Open,
      })) || []
    );
  } catch (error) {
    console.log(error instanceof Error && error.stack);
    return [];
  }
};

export const getClosedMarkets = async (searchParams?: CommonSearchParams): Promise<Market[]> => {
  try {
    const client = createApolloClient();

    const page = Number(searchParams?.page || "1");
    const pageSize = Number(searchParams?.pageSize || "10");

    const skip = (page - 1) * pageSize;
    const first = pageSize;

    const orderBy = isInEnum(Market_OrderBy, searchParams?.sortBy)
      ? searchParams.sortBy
      : Market_OrderBy.VolumeUsd;
    const orderDirection = isInEnum(OrderDirection, searchParams?.sortDirection)
      ? searchParams.sortDirection
      : OrderDirection.Desc;

    const result = await client.query({
      query: GET_CLOSED_MARKETS,
      variables: {
        first,
        skip,
        orderBy,
        orderDirection,
        searchTerm: searchParams?.searchTerm?.trim() || "",
        currentTime: getUnixTime(new Date()).toString(),
      },
    });
    handleErrors(result);

    return result?.data?.markets?.map<Market>(parseGraphQLMarket) || [];
  } catch (error) {
    console.log(error instanceof Error && error.stack);
    return [];
  }
};

export const getMarkets = async (searchParams?: CommonSearchParams): Promise<Market[]> => {
  try {
    const client = createApolloClient();

    const page = Number(searchParams?.page || "1");
    const pageSize = Number(searchParams?.pageSize || "10");

    const skip = (page - 1) * pageSize;
    const first = pageSize;

    const orderBy = isInEnum(Market_OrderBy, searchParams?.sortBy)
      ? searchParams.sortBy
      : Market_OrderBy.VolumeUsd;
    const orderDirection = isInEnum(OrderDirection, searchParams?.sortDirection)
      ? searchParams.sortDirection
      : OrderDirection.Desc;

    let state = searchParams?.state || MarketState.Open;
    const states = {
      [MarketState.Open]: "0",
      [MarketState.Closed]: "1",
      [MarketState.Resolved]: "2",
    };

    switch (searchParams?.filter) {
      case "open":
        state = MarketState.Open;
        break;
      case "resolved":
        state = MarketState.Resolved;
        break;
      case "closed":
        return await getClosedMarkets(searchParams);
      case "favorites":
        if (searchParams.addresses) {
          return await getFavoriteMarkets(searchParams.addresses);
        } else {
          return [];
        }
    }

    const result = await client.query({
      query: GET_MARKETS,
      variables: {
        first,
        skip,
        orderBy,
        orderDirection,
        searchTerm: searchParams?.searchTerm?.trim() || "",
        state: states[state],
      },
    });
    handleErrors(result);

    return result?.data?.markets?.map<Market>(parseGraphQLMarket) || [];
  } catch (error) {
    console.log(error instanceof Error && error.stack);
    return [];
  }
};

export const getMarket = async (address: string): Promise<Market | null> => {
  try {
    const client = createApolloClient();

    const result = await client.query({
      query: GET_MARKET,
      variables: { id: address.toLocaleLowerCase() },
    });

    handleErrors(result);

    const marketRaw = result?.data?.market || null;
    if (!marketRaw) {
      return null;
    }

    return parseGraphQLMarket(marketRaw);
  } catch (error) {
    console.log(error instanceof Error && error.stack);
    return null;
  }
};

export const getFavoriteMarkets = async (addresses: string[]): Promise<Market[]> => {
  if (addresses.length === 0) {
    return [];
  }

  try {
    const client = createApolloClient();

    const result = await client.query({
      query: GET_FAVORITE_MARKETS,
      variables: {
        ids: addresses,
      },
    });

    handleErrors(result);

    return result?.data?.markets?.map<Market>(parseGraphQLMarket) || [];
  } catch (error) {
    console.log(error instanceof Error && error.stack);
    return [];
  }
};

export const getChartData = async (address: string, hours: number): Promise<MarketHourlyData[]> => {
  try {
    const client = createApolloClient();

    const result = await client.query({
      query: GET_CHART_DATA,
      variables: {
        id: address,
        first: hours,
      },
    });

    handleErrors(result);

    return (
      result?.data?.marketHourDatas?.map((m) => parseGraphQlMarketHourData(m, hours)) || []
    ).reverse();
  } catch (error) {
    console.log(error instanceof Error && error.stack);
    return [];
  }
};

export const getTopHolders = async (address: string): Promise<TopHoldersResult> => {
  try {
    const client = createApolloClient();

    const result0 = await client.query({
      query: GET_TOP_HOLDERS_0,
      variables: { id: address },
    });

    const result1 = await client.query({
      query: GET_TOP_HOLDERS_1,
      variables: { id: address },
    });

    handleErrors(result0);
    handleErrors(result1);

    const holders: TopHoldersResult = {
      outcome0: result0?.data?.market?.userOutcomeShares?.map(parseGraphQlHolders) || [],
      outcome1: result1?.data?.market?.userOutcomeShares?.map(parseGraphQlHolders) || [],
    };

    return holders;
  } catch (error) {
    console.log(error instanceof Error && error.stack);
    return { outcome0: [], outcome1: [] };
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const client = createApolloClient();

    const result = await client.query({
      query: GET_USER_PROFILE,
      variables: { userId: userId.toLowerCase() },
    });

    handleErrors(result);

    const user = result?.data?.user || null;

    if (!user) {
      const defaultProfile = getDefaultUserProfile();
      defaultProfile.id = userId;
      return defaultProfile;
    }

    // Helper function to safely parse trading events
    const safeParseTradingEvent = (
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
    ) => {
      try {
        return parseGraphQLTradingEvent(event, type);
      } catch (parseError) {
        console.warn(`Failed to parse trading event ${event.id}:`, parseError);
        return null;
      }
    };

    // Helper function to safely parse liquidity events
    const safeParseLiquidityEvent = (
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
    ) => {
      try {
        return parseGraphQLLiquidityEvent(event, type);
      } catch (parseError) {
        console.warn(`Failed to parse liquidity event ${event.id}:`, parseError);
        return null;
      }
    };

    return {
      id: user.id,
      marketDatas:
        user.marketDatas
          ?.map((md) => {
            const market = parseGraphQLMarket(md.market);
            if (!market) return null;

            return {
              id: md.id,
              feesClaimed: md.feesClaimed,
              rewardsClaimed: md.rewardsClaimed,
              liquidityShares: md.liquidityShares,
              market,
              outcomes:
                md.outcomes?.map((o) => ({
                  id: o.id,
                  index: Number(o.index),
                  shares: o.shares,
                })) || [],
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null) || [],
      sharesBoughtEvents:
        user.sharesBoughtEvents
          ?.map((e) => safeParseTradingEvent(e, "buy"))
          .filter((item): item is NonNullable<typeof item> => item !== null) || [],
      sharesSoldEvents:
        user.sharesSoldEvents
          ?.map((e) => safeParseTradingEvent(e, "sell"))
          .filter((item): item is NonNullable<typeof item> => item !== null) || [],
      liquidityAddedEvents:
        user.liquidityAddedEvents
          ?.map((e) => safeParseLiquidityEvent(e, "add"))
          .filter((item): item is NonNullable<typeof item> => item !== null) || [],
      liquidityRemovedEvents:
        user.liquidityRemovedEvents
          ?.map((e) => safeParseLiquidityEvent(e, "remove"))
          .filter((item): item is NonNullable<typeof item> => item !== null) || [],
      feesClaimedEvents:
        user.feesClaimedEvents
          ?.map((e) => ({
            amount: e.amount,
          }))
          .filter((item): item is NonNullable<typeof item> => item !== null) || [],
      rewardClaims:
        user.rewardClaims
          ?.map((e) => ({
            amount: e.amount,
          }))
          .filter((item): item is NonNullable<typeof item> => item !== null) || [],
    };
  } catch (error) {
    console.log(error instanceof Error && error.stack);
    return null;
  }
};

export const getUserCreatedMarkets = async (creator: string): Promise<Market[]> => {
  try {
    const client = createApolloClient();

    const result = await client.query({
      query: GET_USER_CREATED_MARKETS,
      variables: { creator: creator.toLowerCase() },
    });

    handleErrors(result);

    const markets = result?.data?.markets || [];
    const parsedMarkets: Market[] = [];

    for (const market of markets) {
      try {
        const parsedMarket = parseGraphQLMarket(market);
        parsedMarkets.push(parsedMarket);
      } catch (parseError) {
        console.warn(`Failed to parse market ${market.id}:`, parseError);
        // Skip this market and continue with others
      }
    }

    return parsedMarkets;
  } catch (error) {
    console.log(error instanceof Error && error.stack);
    return [];
  }
};

export const getUserShares = async (userId: string): Promise<UserOutcome[]> => {
  try {
    const client = createApolloClient();

    const result = await client.query({
      query: GET_USER_SHARES,
      variables: { userId: userId.toLowerCase() },
    });

    handleErrors(result);

    const userOutcomes = result?.data?.userOutcomes || [];
    const parsedOutcomes: UserOutcome[] = [];

    for (const outcome of userOutcomes) {
      try {
        const parsedOutcome = parseGraphQLUserOutcome(outcome);
        parsedOutcomes.push(parsedOutcome);
      } catch (parseError) {
        console.warn(`Failed to parse user outcome ${outcome.id}:`, parseError);
        // Skip this outcome and continue with others
      }
    }

    return parsedOutcomes;
  } catch (error) {
    console.log(error instanceof Error && error.stack);
    return [];
  }
};

function getDefaultUserProfile(): UserProfile {
  return {
    id: "",
    marketDatas: [],
    sharesBoughtEvents: [],
    sharesSoldEvents: [],
    liquidityAddedEvents: [],
    liquidityRemovedEvents: [],
    feesClaimedEvents: [],
    rewardClaims: [],
  };
}
