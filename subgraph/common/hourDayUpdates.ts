import { Market, MarketDayData, MarketDayOutcome, MarketHourData, MarketHourOutcome } from '../generated/schema';
import { ethereum, BigInt, Bytes, store } from '@graphprotocol/graph-ts';
import { fetchMarket } from './loaders';
import { ZERO_BI, ARCHIVE_HOURS_THRESHOLD, MAX_ARCHIVE_BATCH_SIZE } from './constants';

// Helper function to find the last known hour data for a market
function findLastKnownHourData(marketAddress: Bytes, currentHourIndex: i32): MarketHourData | null {
  let lastKnownHourData: MarketHourData | null = null;
  let searchIndex = currentHourIndex - 1;
  let maxSearchAttempts = 1000; // Prevent infinite loops, limit search to last 1000 hours

  while (searchIndex >= 0 && lastKnownHourData == null && maxSearchAttempts > 0) {
    let searchHourMarketID = marketAddress
      .concat(Bytes.fromUTF8('-'))
      .concat(Bytes.fromByteArray(Bytes.fromI32(searchIndex)));
    lastKnownHourData = MarketHourData.load(searchHourMarketID);
    searchIndex--;
    maxSearchAttempts--;
  }

  return lastKnownHourData;
}

// Helper function to find the last known day data for a market
function findLastKnownDayData(marketAddress: Bytes, currentDayID: i32): MarketDayData | null {
  let lastKnownDayData: MarketDayData | null = null;
  let searchDayID = currentDayID - 1;
  let maxSearchAttempts = 100; // Prevent infinite loops, limit search to last 100 days

  while (searchDayID >= 0 && lastKnownDayData == null && maxSearchAttempts > 0) {
    let searchDayMarketID = marketAddress
      .concat(Bytes.fromUTF8('-'))
      .concat(Bytes.fromByteArray(Bytes.fromI32(searchDayID)));
    lastKnownDayData = MarketDayData.load(searchDayMarketID);
    searchDayID--;
    maxSearchAttempts--;
  }

  return lastKnownDayData;
}

function fetchMarketHourOutcome(marketHourData: MarketHourData, index: BigInt): MarketHourOutcome {
  let hourMarketOutcomeID = marketHourData.id
    .concat(Bytes.fromUTF8('-'))
    .concat(Bytes.fromByteArray(Bytes.fromI32(index.toI32())));

  let marketHourOutcome = MarketHourOutcome.load(hourMarketOutcomeID);
  let market = fetchMarket(marketHourData.market);

  if (!marketHourOutcome) {
    marketHourOutcome = new MarketHourOutcome(hourMarketOutcomeID);
    marketHourOutcome.market = marketHourData.market;
    marketHourOutcome.marketHourData = marketHourData.id;
    marketHourOutcome.index = index;
    marketHourOutcome.price = market.outcomesPrice[index.toU32()];
    marketHourOutcome.save();
  }
  return marketHourOutcome as MarketHourOutcome;
}

function fetchMarketDayOutcome(marketDayData: MarketDayData, index: BigInt): MarketDayOutcome {
  let dayMarketOutcomeID = marketDayData.id
    .concat(Bytes.fromUTF8('-'))
    .concat(Bytes.fromByteArray(Bytes.fromI32(index.toI32())));

  let marketDayOutcome = MarketDayOutcome.load(dayMarketOutcomeID);
  let market = fetchMarket(marketDayData.market);

  if (!marketDayOutcome) {
    marketDayOutcome = new MarketDayOutcome(dayMarketOutcomeID);
    marketDayOutcome.market = marketDayData.market;
    marketDayOutcome.marketDayData = marketDayData.id;
    marketDayOutcome.index = index;
    marketDayOutcome.price = market.outcomesPrice[index.toU32()];
    marketDayOutcome.save();
  }
  return marketDayOutcome as MarketDayOutcome;
}

export function fetchMarketHourData(market: Market, event: ethereum.Event): MarketHourData {
  let timestamp = event.block.timestamp.toI32();
  let hourIndex = timestamp / 3600; // get unique hour within unix history
  let hourStartUnix = hourIndex * 3600; // want the rounded effect
  let hourMarketID = event.address.concat(Bytes.fromUTF8('-')).concat(Bytes.fromByteArray(Bytes.fromI32(hourIndex)));

  let marketHourData = MarketHourData.load(hourMarketID);
  let isNew = false;

  if (!marketHourData) {
    // Find the last known hour data to fill gaps
    let lastKnownHourData = findLastKnownHourData(event.address, hourIndex);

    // Fill gaps from last known hour to current hour (exclusive)
    if (lastKnownHourData != null) {
      let lastKnownIndex = lastKnownHourData.hourStartUnix / 3600;
      let currentIndex = hourIndex;

      // Fill each missing hour with the same data as the last known hour
      for (let i = lastKnownIndex + 1; i < currentIndex; i++) {
        let missingHourStartUnix = i * 3600;
        let missingHourMarketID = event.address
          .concat(Bytes.fromUTF8('-'))
          .concat(Bytes.fromByteArray(Bytes.fromI32(i)));

        let missingHourData = new MarketHourData(missingHourMarketID);
        missingHourData.market = market.id;
        missingHourData.hourStartUnix = missingHourStartUnix;
        missingHourData.hourlyVolumeUSD = lastKnownHourData.hourlyVolumeUSD;
        missingHourData.hourlyTvlUSD = lastKnownHourData.hourlyTvlUSD;
        missingHourData.save();

        // Create outcome prices for the missing hour (same as last known hour)
        for (let j = 0; j < market.outcomesPrice.length; j++) {
          let lastKnownOutcomeID = lastKnownHourData.id
            .concat(Bytes.fromUTF8('-'))
            .concat(Bytes.fromByteArray(Bytes.fromI32(j)));
          let lastKnownOutcome = MarketHourOutcome.load(lastKnownOutcomeID);

          if (lastKnownOutcome != null) {
            let missingHourOutcome = fetchMarketHourOutcome(missingHourData, BigInt.fromU32(j));
            missingHourOutcome.price = lastKnownOutcome.price;
            missingHourOutcome.save();
          }
        }
      }
    }

    // Create current hour data
    marketHourData = new MarketHourData(hourMarketID);
    marketHourData.market = market.id;
    marketHourData.hourStartUnix = hourStartUnix;
    marketHourData.hourlyVolumeUSD = market.volumeUSD;
    marketHourData.hourlyTvlUSD = market.tvlUSD;
    marketHourData.save();

    for (let i = 0; i < market.outcomesPrice.length; i++) {
      let outcomePrice = market.outcomesPrice[i];
      let marketHourOutcome = fetchMarketHourOutcome(marketHourData, BigInt.fromU32(i));
      marketHourOutcome.price = outcomePrice;
      marketHourOutcome.save();
    }

    isNew = true;
  }

  // Update archiving fields and handle archiving
  if (market.lastHourArchived.equals(ZERO_BI) && market.lastHourRecorded.equals(ZERO_BI)) {
    market.lastHourRecorded = BigInt.fromI32(hourIndex);
    market.lastHourArchived = BigInt.fromI32(hourIndex - 1);
  }

  if (isNew) {
    // Add current hour to the hourArray for tracking
    let hourArray = market.hourArray;
    hourArray.push(hourIndex);
    market.hourArray = hourArray;

    let lastHourArchived = market.lastHourArchived.toI32();
    let stop = hourIndex - ARCHIVE_HOURS_THRESHOLD;
    if (stop > lastHourArchived) {
      archiveHourData(market, stop);
    }
    market.lastHourRecorded = BigInt.fromI32(hourIndex);
    market.save();
  }

  return marketHourData as MarketHourData;
}

export function fetchMarketDayData(market: Market, event: ethereum.Event): MarketDayData {
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;
  let dayMarketID = event.address.concat(Bytes.fromUTF8('-')).concat(Bytes.fromByteArray(Bytes.fromI32(dayID)));
  let marketDayData = MarketDayData.load(dayMarketID);
  if (!marketDayData) {
    // Find the last known day data to fill gaps
    let lastKnownDayData = findLastKnownDayData(event.address, dayID);

    // Fill gaps from last known day to current day (exclusive)
    if (lastKnownDayData != null) {
      let lastKnownDay = lastKnownDayData.date / 86400;
      let currentDay = dayID;

      // Fill each missing day with the same data as the last known day
      for (let i = lastKnownDay + 1; i < currentDay; i++) {
        let missingDayStartTimestamp = i * 86400;
        let missingDayMarketID = event.address
          .concat(Bytes.fromUTF8('-'))
          .concat(Bytes.fromByteArray(Bytes.fromI32(i)));

        let missingDayData = new MarketDayData(missingDayMarketID);
        missingDayData.market = market.id;
        missingDayData.date = missingDayStartTimestamp;
        missingDayData.dailyVolumeUSD = lastKnownDayData.dailyVolumeUSD;
        missingDayData.dailyTvlUSD = lastKnownDayData.dailyTvlUSD;
        missingDayData.save();

        // Create outcome prices for the missing day (same as last known day)
        for (let j = 0; j < market.outcomesPrice.length; j++) {
          let lastKnownOutcomeID = lastKnownDayData.id
            .concat(Bytes.fromUTF8('-'))
            .concat(Bytes.fromByteArray(Bytes.fromI32(j)));
          let lastKnownOutcome = MarketDayOutcome.load(lastKnownOutcomeID);

          if (lastKnownOutcome != null) {
            let missingDayOutcome = fetchMarketDayOutcome(missingDayData, BigInt.fromU32(j));
            missingDayOutcome.price = lastKnownOutcome.price;
            missingDayOutcome.save();
          }
        }
      }
    }

    // Create current day data
    marketDayData = new MarketDayData(dayMarketID);
    marketDayData.market = market.id;
    marketDayData.date = dayStartTimestamp;
    marketDayData.dailyVolumeUSD = market.volumeUSD;
    marketDayData.dailyTvlUSD = market.tvlUSD;
    marketDayData.save();

    for (let i = 0; i < market.outcomesPrice.length; i++) {
      let outcomePrice = market.outcomesPrice[i];
      let marketDayOutcome = fetchMarketDayOutcome(marketDayData, BigInt.fromU32(i));
      marketDayOutcome.price = outcomePrice;
      marketDayOutcome.save();
    }
  }

  return marketDayData as MarketDayData;
}

export function trackPrices(market: Market, event: ethereum.Event, outcomePrices: Array<BigInt>): void {
  let marketHourData = fetchMarketHourData(market, event);
  for (let i = 0; i < outcomePrices.length; i++) {
    let outcomePrice = outcomePrices[i];
    let marketHourOutcome = fetchMarketHourOutcome(marketHourData, BigInt.fromU32(i));
    marketHourOutcome.price = outcomePrice;
    marketHourOutcome.save();
  }

  let marketDayData = fetchMarketDayData(market, event);
  for (let i = 0; i < outcomePrices.length; i++) {
    let outcomePrice = outcomePrices[i];
    let marketDayOutcome = fetchMarketDayOutcome(marketDayData, BigInt.fromU32(i));
    marketDayOutcome.price = outcomePrice;
    marketDayOutcome.save();
  }
}

function archiveHourData(market: Market, end: i32): void {
  let length = market.hourArray.length;
  let array = market.hourArray;
  let modArray = market.hourArray;
  let last = market.lastHourArchived.toI32();

  for (let i = 0; i < length; i++) {
    if (array[i] > end) {
      break;
    }

    let marketHourID = market.id.concat(Bytes.fromUTF8('-')).concat(Bytes.fromByteArray(Bytes.fromI32(array[i])));

    // Remove the hour data and its outcomes
    store.remove('MarketHourData', marketHourID.toHexString());

    // Remove all outcomes for this hour
    for (let j = 0; j < market.outcomeCount.toI32(); j++) {
      let marketHourOutcomeID = marketHourID.concat(Bytes.fromUTF8('-')).concat(Bytes.fromByteArray(Bytes.fromI32(j)));
      store.remove('MarketHourOutcome', marketHourOutcomeID.toHexString());
    }

    modArray.shift();
    last = array[i];

    if (BigInt.fromI32(i + 1).equals(BigInt.fromI32(MAX_ARCHIVE_BATCH_SIZE))) {
      break;
    }
  }

  if (modArray) {
    market.hourArray = modArray;
  } else {
    market.hourArray = new Array<i32>(0);
  }

  market.lastHourArchived = BigInt.fromI32(last - 1);
  market.save();
}
