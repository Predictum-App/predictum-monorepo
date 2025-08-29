# Prediction Market Smart Contracts

The platform allows users to create and participate in prediction markets, betting on outcomes with potential rewards based on accurate predictions or participate as a liquidity provider

## Table of Contents

- [Prediction Market Smart Contracts](#prediction-market-smart-contracts)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Architecture](#architecture)
  - [Setup](#setup)
  - [Deployment](#deployment)
  - [Contracts](#contracts)
    - [MarketFactory](#marketfactory)
    - [Market](#market)
    - [MarketAMM](#marketamm)
    - [Oracle](#oracle)
  - [Testing](#testing)

## Overview

The prediction market platform consists of several smart contracts that manage the creation and operation of prediction markets. Users can add liquidity, remove liquidity, buy shares, sell shares, and claim rewards based on the outcomes of the markets.

## Architecture

The core contracts in this repository are:

- `MarketFactory`: A factory contract that creates and manages individual `Market` instances.
- `Market`: A contract that handles user betting logic, tracks outcomes, and manages reward distribution.
- `MarketAMM`: A contract used for calculations by the `Market` contract, implementing the constant product formula.

## Setup

To set up the project locally, follow these steps:

1. **Create `.env` file and fill the variables**

   ```sh
   make env
   ```

2. **Install dependencies and deploy local MarketFactory:**

   ```sh
   make setup:local
   ```

## Deployment

You can deploy the contracts locally, on testnet or manually to any network:

1. **Deploy the Market Factory contract:**

   ```sh
   make deploy:market-factory
   ```

   or

   ```sh
   make deploy:local
   ```

## Contracts

### MarketFactory

The `MarketFactory` contract is responsible for creating and managing individual `Market` instances. It stores a reference to the `Market` implementation contract and can create new `Market` instances using the `createMarket` function. The factory keeps track of all created markets for easy enumeration.

### Market

Each `Market` instance handles user betting logic, tracks outcomes, and manages reward distribution. The contract holds liquidity and integrates with an oracle to settle the market outcome. Users can add liquidity, buy shares, and claim rewards based on the resolved outcome.

### MarketAMM

The `MarketAMM` contract is used for calculations by the `Market` contract. It implements the constant product formula to manage the liquidity pool and calculate the prices of shares.

### Oracle

The `Oracle` contract provides the outcome of the market. In production, a real oracle might fetch data from trusted APIs (e.g., Chainlink). For demonstration purposes, the `CentralizedOracle` contract allows manual setting of the outcome.

## Testing

To run the tests, use the following command:

```sh
make test
```

```sh
make coverage
```
