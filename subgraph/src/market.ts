import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts';

import {
  FeesClaimed as FeesClaimedEvent,
  LiquidityAdded as LiquidityAddedEvent,
  LiquidityClaimed as LiquidityClaimedEvent,
  LiquidityRemoved as LiquidityRemovedEvent,
  MarketInitialized as MarketInitializedEvent,
  MarketStateUpdated as MarketStateUpdatedEvent,
  RewardsClaimed as RewardsClaimedEvent,
  SharesBought as SharesBoughtEvent,
  SharesSold as SharesSoldEvent,
  MarketResolved as MarketResolvedEvent,
} from '../generated/templates/MarketTemplate/Market';
import {
  FeesClaimed,
  LiquidityAdded,
  LiquidityClaimed,
  LiquidityRemoved,
  Market,
  MarketFactory,
  MarketStateUpdated,
  RewardsClaimed,
  SharesBought,
  SharesSold,
  User,
  UserMarketData,
  UserOutcome,
} from '../generated/schema';
import { MARKET_FACTORY } from '../common/constants';
import {
  fetchMarketHourData,
  fetchMarketDayData,
  trackPrices,
} from '../common/hourDayUpdates';
import { fetchMarket } from '../common/loaders';

const getUserMarketDataId = (market: Market, user: User): Bytes =>
  market.id.concat(Bytes.fromUTF8('-')).concat(user.id);

const getUserOutcomeId = (market: Market, user: User, index: BigInt): Bytes =>
  market.id
    .concat(Bytes.fromUTF8('-'))
    .concat(user.id)
    .concat(Bytes.fromUTF8('-'))
    .concat(Bytes.fromByteArray(Bytes.fromBigInt(index)));

function fetchMarketFactory(): MarketFactory {
  const id = Bytes.fromHexString(MARKET_FACTORY);
  return MarketFactory.load(id) as MarketFactory;
}

function fetchUser(id: Address): User {
  let user = User.load(id);
  if (user == null) {
    user = new User(id);
    user.save();
  }
  return user as User;
}

function fetchUserOutcome(
  market: Market,
  user: User,
  marketData: UserMarketData,
  index: BigInt
): UserOutcome {
  let id = getUserOutcomeId(market, user, index);
  let userOutcome = UserOutcome.load(id);

  if (userOutcome == null) {
    userOutcome = new UserOutcome(id);
    userOutcome.index = index;
    userOutcome.market = market.id;
    userOutcome.user = user.id;
    userOutcome.marketData = marketData.id;
    userOutcome.shares = BigInt.zero();
    userOutcome.save();
  }
  return userOutcome;
}

function fetchUserMarketData(market: Market, user: User): UserMarketData {
  let id = getUserMarketDataId(market, user);
  let userMarketData = UserMarketData.load(id);
  if (userMarketData == null) {
    userMarketData = new UserMarketData(id);
    userMarketData.market = market.id;
    userMarketData.user = user.id;
    userMarketData.feesClaimed = BigInt.zero();
    userMarketData.rewardsClaimed = BigInt.zero();
    userMarketData.liquidityShares = BigInt.zero();
    userMarketData.save();
    for (let i = 0; i < market.outcomeCount.length; ++i) {
      fetchUserOutcome(market, user, userMarketData, BigInt.fromU32(i));
    }
  }
  return userMarketData as UserMarketData;
}

function updateMarketFactoryVolume(volumeUSD: BigInt): void {
  // Load MarketFactory using the address from constants
  let marketFactory = fetchMarketFactory();
  marketFactory.totalVolumeUSD = marketFactory.totalVolumeUSD.plus(volumeUSD);
  marketFactory.save();
}

export function handleFeesClaimed(event: FeesClaimedEvent): void {
  let entity = new FeesClaimed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );

  let market = fetchMarket(event.address);
  let user = fetchUser(event.params._claimer);

  entity.market = market.id;
  entity.claimer = user.id;

  entity.amount = event.params._amount;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  const userMarketData = fetchUserMarketData(market, user);
  userMarketData.feesClaimed = userMarketData.feesClaimed.plus(
    event.params._amount
  );
  userMarketData.save();
}

export function handleLiquidityAdded(event: LiquidityAddedEvent): void {
  let entity = new LiquidityAdded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );

  let market = fetchMarket(event.address);
  let user = fetchUser(event.params._provider);

  entity.market = market.id;
  entity.provider = user.id;
  entity.amount = event.params._amount;

  entity.liquidityShares = event.params._liquidityShares;
  entity.outcomeSharesReturned = event.params._outcomeShareToReturn;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  const userMarketData = fetchUserMarketData(market, user);
  userMarketData.liquidityShares = userMarketData.liquidityShares.plus(
    event.params._liquidityShares
  );
  for (let i = 0; i < event.params._outcomeShareToReturn.length; ++i) {
    let outcome = fetchUserOutcome(
      market,
      user,
      userMarketData,
      BigInt.fromU32(i)
    );
    outcome.shares = outcome.shares.plus(event.params._outcomeShareToReturn[i]);
    outcome.save();
  }
  userMarketData.save();

  // Update market TVL (Total Value Locked)
  market.tvlUSD = market.tvlUSD.plus(event.params._amount);
  market.save();

  // Update MarketFactory total liquidity
  let marketFactory = fetchMarketFactory();
  marketFactory.totalLiqudityUSD = marketFactory.totalLiqudityUSD.plus(
    event.params._amount
  );
  marketFactory.save();

  // Update hourly and daily TVL data
  const marketHourData = fetchMarketHourData(market, event);
  marketHourData.hourlyTvlUSD = marketHourData.hourlyTvlUSD.plus(
    event.params._amount
  );
  marketHourData.save();

  const marketDayData = fetchMarketDayData(market, event);
  marketDayData.dailyTvlUSD = marketDayData.dailyTvlUSD.plus(
    event.params._amount
  );
  marketDayData.save();
}

export function handleLiquidityRemoved(event: LiquidityRemovedEvent): void {
  let entity = new LiquidityRemoved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  let market = fetchMarket(event.address);
  let user = fetchUser(event.params._provider);

  entity.market = market.id;
  entity.provider = user.id;

  entity.shares = event.params._shares;
  entity.amount = event.params._amount;
  entity.outcomeSharesReturned = event.params._outcomeShareToReturn;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  const userMarketData = fetchUserMarketData(market, user);
  userMarketData.liquidityShares = userMarketData.liquidityShares.minus(
    event.params._shares
  );
  for (let i = 0; i < event.params._outcomeShareToReturn.length; ++i) {
    let outcome = fetchUserOutcome(
      market,
      user,
      userMarketData,
      BigInt.fromU32(i)
    );
    outcome.shares = outcome.shares.plus(event.params._outcomeShareToReturn[i]);
    outcome.save();
  }
  userMarketData.save();

  // Update market TVL (Total Value Locked) - decrease when liquidity is removed
  market.tvlUSD = market.tvlUSD.minus(event.params._amount);
  market.save();

  // Update MarketFactory total liquidity
  let marketFactory = fetchMarketFactory();
  marketFactory.totalLiqudityUSD = marketFactory.totalLiqudityUSD.minus(
    event.params._amount
  );
  marketFactory.save();

  // Update hourly and daily TVL data
  const marketHourData = fetchMarketHourData(market, event);
  marketHourData.hourlyTvlUSD = marketHourData.hourlyTvlUSD.minus(
    event.params._amount
  );
  marketHourData.save();

  const marketDayData = fetchMarketDayData(market, event);
  marketDayData.dailyTvlUSD = marketDayData.dailyTvlUSD.minus(
    event.params._amount
  );
  marketDayData.save();
}

export function handleLiquidityClaimed(event: LiquidityClaimedEvent): void {
  let entity = new LiquidityClaimed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );

  let market = fetchMarket(event.address);
  let user = fetchUser(event.params._claimer);

  entity.market = market.id;
  entity.claimer = user.id;

  entity.amount = event.params._amount;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  const userData = fetchUserMarketData(market, user);
  userData.liquidityShares = BigInt.zero();
  userData.save();
}

export function handleMarketInitialized(event: MarketInitializedEvent): void {
  let market = fetchMarket(event.address);

  if (market) {
    market.marketURI = event.params._marketURI;
    market.question = event.params._question;
    market.outcomeCount = event.params._outcomeCount;
    market.outcomes = event.params._outcomeNames;
    market.outcomesPrice = event.params._outcomePrices;
    market.closeTime = event.params._closeTime;
    market.creator = event.params._creator;
    market.oracle = event.params._oracle;
    market.marketAMM = event.params._marketAMM;
    market.resolveDelay = event.params._resolveDelay;
    market.feeBPS = event.params._feeBPS;

    market.blockNumber = event.block.number;

    market.save();
  }
}

export function handleMarketStateUpdated(event: MarketStateUpdatedEvent): void {
  let entity = new MarketStateUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );

  let market = fetchMarket(event.address);

  entity.market = market.id;

  entity.updatedAt = event.params._updatedAt;
  entity.state = event.params._state;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  market.state = BigInt.fromI32(event.params._state);

  if (event.params._state == 1) {
    market.closedAtTime = event.block.timestamp;
  }

  market.save();
}

export function handleRewardsClaimed(event: RewardsClaimedEvent): void {
  let entity = new RewardsClaimed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );

  let market = fetchMarket(event.address);
  let user = fetchUser(event.params._claimer);

  entity.market = market.id;
  entity.claimer = user.id;

  entity.amount = event.params._amount;
  entity.outcomeIndex = event.params._outcomeIndex;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  const userData = fetchUserMarketData(market, user);
  userData.rewardsClaimed = event.params._amount;
  userData.save();

  const index = event.params._outcomeIndex.toU32();
  let outcome = fetchUserOutcome(market, user, userData, BigInt.fromU32(index));
  outcome.shares = BigInt.zero();
  outcome.save();
}

export function handleSharesBought(event: SharesBoughtEvent): void {
  let entity = new SharesBought(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );

  let market = fetchMarket(event.address);
  let user = fetchUser(event.params._buyer);

  entity.market = market.id;
  entity.buyer = user.id;

  entity.buyer = event.params._buyer;
  entity.outcomeIndex = event.params._outcomeIndex;
  entity.amount = event.params._amount;
  entity.fee = event.params._fee;
  entity.shares = event.params._shares;
  entity.newOutcomePrice = event.params._newOutcomePrice;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  market.outcomesPrice = event.params._newOutcomePrice;
  market.volumeUSD = market.volumeUSD.plus(event.params._amount);

  // Update TVL - when shares are bought, the pool balance increases
  // The amount after fees goes into the pool
  let amountAfterFees = event.params._amount.minus(event.params._fee);
  market.tvlUSD = market.tvlUSD.plus(amountAfterFees);

  market.save();

  const index = event.params._outcomeIndex.toU32();
  let outcome = fetchUserOutcome(
    market,
    user,
    fetchUserMarketData(market, user),
    BigInt.fromU32(index)
  );
  outcome.shares = outcome.shares.plus(event.params._shares);
  outcome.save();

  updateMarketFactoryVolume(event.params._amount);
  const marketHourData = fetchMarketHourData(market, event);
  marketHourData.hourlyVolumeUSD = marketHourData.hourlyVolumeUSD.plus(
    event.params._amount
  );
  marketHourData.save();

  const marketDayData = fetchMarketDayData(market, event);
  marketDayData.dailyVolumeUSD = marketDayData.dailyVolumeUSD.plus(
    event.params._amount
  );
  marketDayData.save();

  // Update hourly and daily TVL data
  marketHourData.hourlyTvlUSD =
    marketHourData.hourlyTvlUSD.plus(amountAfterFees);
  marketDayData.dailyTvlUSD = marketDayData.dailyTvlUSD.plus(amountAfterFees);
  marketHourData.save();
  marketDayData.save();

  trackPrices(market, event, event.params._newOutcomePrice);
}

export function handleSharesSold(event: SharesSoldEvent): void {
  let entity = new SharesSold(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );

  let market = fetchMarket(event.address);
  let user = fetchUser(event.params._seller);

  entity.market = market.id;
  entity.seller = user.id;

  entity.seller = event.params._seller;
  entity.outcomeIndex = event.params._outcomeIndex;
  entity.amount = event.params._amount;
  entity.fee = event.params._fee;
  entity.shares = event.params._shares;
  entity.newOutcomePrice = event.params._newOutcomePrice;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  market.outcomesPrice = event.params._newOutcomePrice;
  market.volumeUSD = market.volumeUSD.plus(event.params._amount);

  // Update TVL - when shares are sold, the pool balance decreases
  // The amount before fees is removed from the pool
  market.tvlUSD = market.tvlUSD.minus(event.params._amount);

  market.save();

  const index = event.params._outcomeIndex.toU32();
  let outcome = fetchUserOutcome(
    market,
    user,
    fetchUserMarketData(market, user),
    BigInt.fromU32(index)
  );
  outcome.shares = outcome.shares.minus(event.params._shares);
  outcome.save();

  updateMarketFactoryVolume(event.params._amount);

  const marketHourData = fetchMarketHourData(market, event);
  marketHourData.hourlyVolumeUSD = marketHourData.hourlyVolumeUSD.plus(
    event.params._amount
  );
  marketHourData.save();

  const marketDayData = fetchMarketDayData(market, event);
  marketDayData.dailyVolumeUSD = marketDayData.dailyVolumeUSD.plus(
    event.params._amount
  );
  marketDayData.save();

  // Update hourly and daily TVL data
  marketHourData.hourlyTvlUSD = marketHourData.hourlyTvlUSD.minus(
    event.params._amount
  );
  marketDayData.dailyTvlUSD = marketDayData.dailyTvlUSD.minus(
    event.params._amount
  );
  marketHourData.save();
  marketDayData.save();

  trackPrices(market, event, event.params._newOutcomePrice);
}

export function handleMarketResolved(event: MarketResolvedEvent): void {
  let market = fetchMarket(event.address);
  market.resolvedOutcome = event.params._outcomeIndex;
  market.save();
}
