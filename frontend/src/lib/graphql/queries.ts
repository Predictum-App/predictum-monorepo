import { gql } from "@/__generated__/gql";

/**
 * Cannot use fragment because the lib generation cannot derive types. It should be fixed
 */

// Featured markets: top 8 by TVL, open only
export const GET_FEATURED_MARKETS = gql(/* GraphQL */ `
  query GetFeaturedMarkets {
    markets(
      orderBy: volumeUSD
      orderDirection: desc
      first: 8
      where: { state: "0", blockNumber_gte: "194543090" }
    ) {
      closeTime
      closedAtTime
      createTime
      creator
      feeBPS
      id
      outcomeCount
      outcomes
      outcomesPrice
      question
      tvlUSD
      volumeUSD
      resolveDelay
      marketURI
    }
  }
`);

export const GET_MARKETS = gql(/* GraphQL */ `
  query GetMarkets(
    $first: Int = 10
    $skip: Int = 0
    $orderBy: Market_orderBy = id
    $orderDirection: OrderDirection = asc
    $searchTerm: String = ""
    $state: BigInt = "0"
  ) {
    markets(
      where: { question_contains_nocase: $searchTerm, state: $state, blockNumber_gte: "194543090" }
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      closeTime
      closedAtTime
      createTime
      creator
      feeBPS
      id
      outcomeCount
      outcomes
      outcomesPrice
      question
      tvlUSD
      volumeUSD
      resolveDelay
      state
      resolvedOutcome
      marketURI
    }
  }
`);

export const GET_CLOSED_MARKETS = gql(/* GraphQL */ `
  query GetClosedMarkets(
    $currentTime: BigInt!
    $first: Int = 10
    $skip: Int = 0
    $orderBy: Market_orderBy = id
    $orderDirection: OrderDirection = asc
    $searchTerm: String = ""
  ) {
    markets(
      where: {
        question_contains_nocase: $searchTerm
        closeTime_lte: $currentTime
        state_not: "2"
        blockNumber_gte: "194543090"
      }
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      closeTime
      closedAtTime
      createTime
      creator
      feeBPS
      id
      outcomeCount
      outcomes
      outcomesPrice
      question
      tvlUSD
      volumeUSD
      resolveDelay
      state
      resolvedOutcome
      marketURI
    }
  }
`);

// Single market by ID
export const GET_MARKET = gql(/* GraphQL */ `
  query GetMarket($id: ID!) {
    market(id: $id) {
      closeTime
      closedAtTime
      createTime
      creator
      feeBPS
      id
      outcomeCount
      outcomes
      outcomesPrice
      question
      tvlUSD
      volumeUSD
      resolveDelay
      state
      resolvedOutcome
      marketURI
    }
  }
`);

export const GET_FAVORITE_MARKETS = gql(/* GraphQL */ `
  query GetFavoriteMarkets($ids: [Bytes!]!) {
    markets(where: { id_in: $ids }) {
      closeTime
      closedAtTime
      createTime
      creator
      feeBPS
      id
      outcomeCount
      outcomes
      outcomesPrice
      question
      tvlUSD
      volumeUSD
      resolveDelay
      state
      resolvedOutcome
      marketURI
    }
  }
`);

export const GET_CHART_DATA = gql(/* GraphQL */ `
  query GetChartData($id: Bytes = "", $first: Int = 10) {
    marketHourDatas(
      where: { market_: { id: $id } }
      orderBy: hourStartUnix
      orderDirection: desc
      first: $first
    ) {
      hourStartUnix
      hourlyTvlUSD
      hourlyVolumeUSD
      marketOutcomePrices {
        index
        price
      }
    }
  }
`);

export const GET_TOP_HOLDERS_0 = gql(/* GraphQL */ `
  query TopHolders0($id: ID = "") {
    market(id: $id) {
      userOutcomeShares(
        orderBy: shares
        orderDirection: asc
        first: 20
        where: { index: "0", shares_gt: "0" }
      ) {
        index
        shares
        user {
          id
        }
      }
    }
  }
`);

export const GET_TOP_HOLDERS_1 = gql(/* GraphQL */ `
  query TopHolders1($id: ID = "") {
    market(id: $id) {
      userOutcomeShares(
        orderBy: shares
        orderDirection: asc
        first: 20
        where: { index: "1", shares_gt: "0" }
      ) {
        index
        shares
        user {
          id
        }
      }
    }
  }
`);

export const GET_USER_PROFILE = gql(/* GraphQL */ `
  query GetUserProfile($userId: ID!) {
    user(id: $userId) {
      id
      marketDatas {
        id
        feesClaimed
        rewardsClaimed
        liquidityShares
        market {
          closeTime
          closedAtTime
          createTime
          creator
          feeBPS
          id
          outcomeCount
          outcomes
          outcomesPrice
          question
          tvlUSD
          volumeUSD
          resolveDelay
          marketURI
        }
        outcomes {
          id
          index
          shares
        }
      }
      sharesBoughtEvents {
        id
        market {
          outcomes
          question
        }
        outcomeIndex
        amount
        fee
        shares
        newOutcomePrice
        blockTimestamp
      }
      sharesSoldEvents {
        id
        market {
          outcomes
          question
        }
        outcomeIndex
        amount
        fee
        shares
        newOutcomePrice
        blockTimestamp
      }
      liquidityAddedEvents {
        id
        market {
          question
        }
        amount
        liquidityShares
        outcomeSharesReturned
        blockTimestamp
      }
      liquidityRemovedEvents {
        id
        market {
          question
        }
        shares
        amount
        outcomeSharesReturned
        blockTimestamp
      }
      feesClaimedEvents {
        amount
      }
      rewardClaims {
        amount
      }
    }
  }
`);

export const GET_USER_CREATED_MARKETS = gql(/* GraphQL */ `
  query GetUserCreatedMarkets($creator: Bytes!) {
    markets(where: { creator: $creator }, orderBy: createTime, orderDirection: desc) {
      closeTime
      closedAtTime
      createTime
      creator
      feeBPS
      id
      outcomeCount
      outcomes
      state
      outcomesPrice
      resolvedOutcome
      question
      tvlUSD
      volumeUSD
      resolveDelay
      marketURI
    }
  }
`);

export const GET_USER_SHARES = gql(/* GraphQL */ `
  query GetUserShares($userId: Bytes!) {
    userOutcomes(where: { user_: { id: $userId }, shares_gt: "0" }) {
      id
      index
      shares
      market {
        closeTime
        closedAtTime
        createTime
        creator
        feeBPS
        id
        outcomeCount
        outcomes
        outcomesPrice
        question
        tvlUSD
        volumeUSD
        resolveDelay
        marketURI
      }
    }
  }
`);
