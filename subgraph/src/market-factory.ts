import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { MarketCreated as MarketCreatedEvent } from '../generated/MarketFactory/MarketFactory';
import { MarketFactory } from '../generated/schema';
import { MarketTemplate } from '../generated/templates';
import { MARKET_FACTORY } from '../common/constants';
import { fetchMarket } from '../common/loaders';

function fetchMarketFactory(): MarketFactory {
  const id = Bytes.fromHexString(MARKET_FACTORY);
  let marketFactory = MarketFactory.load(id);

  if (marketFactory == null) {
    marketFactory = new MarketFactory(id);
    marketFactory.marketCount = BigInt.zero();
    marketFactory.totalVolumeUSD = BigInt.zero();
    marketFactory.totalLiqudityUSD = BigInt.zero();
    marketFactory.save();
  }
  return marketFactory;
}

export function handleMarketCreated(event: MarketCreatedEvent): void {
  const marketFactory = fetchMarketFactory();
  marketFactory.marketCount = marketFactory.marketCount.plus(BigInt.fromU32(1));
  marketFactory.save();

  let market = fetchMarket(event.params.marketAddress);
  // Market Factory data
  market.marketIndex = event.params.marketIndex;
  market.createTime = event.block.timestamp;
  market.creator = event.params.creator;
  market.blockNumber = event.block.number;

  market.save();

  MarketTemplate.create(event.params.marketAddress);
}
