import { BigInt, Bytes } from '@graphprotocol/graph-ts';

import { Market } from '../generated/schema';

export function fetchMarket(id: Bytes): Market {
  let market = Market.load(id);

  if (market == null) {
    market = new Market(id);
    market.marketIndex = BigInt.zero();
    market.marketURI = '';
    market.question = '';
    market.outcomeCount = BigInt.zero();
    market.outcomes = new Array<string>(0);
    market.outcomesPrice = new Array<BigInt>(0);
    market.closeTime = BigInt.zero();
    market.createTime = BigInt.zero();
    market.creator = Bytes.fromHexString('0x');
    market.oracle = Bytes.fromHexString('0x');
    market.marketAMM = Bytes.fromHexString('0x');
    market.resolveDelay = BigInt.zero();
    market.feeBPS = BigInt.zero();
    market.state = BigInt.zero();
    market.closedAtTime = BigInt.zero();
    market.blockNumber = BigInt.zero();
    market.volumeUSD = BigInt.zero();
    market.tvlUSD = BigInt.zero();
    market.save();
  }
  return market as Market;
}
