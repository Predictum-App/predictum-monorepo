# Predictum

#### Welcome to Predictum

We are excited to have you here. This is your starting point for understanding a prediction market that values fairness, transparency, and reliable outcomes.

## Overview

Built on Sei, Predictum is a decentralized and transparent prediction market designed to reward accuracy over influence. Markets are resolved using advanced AI models trained to assess outcomes from multiple trusted sources, removing the need for human arbitration and greatly reducing the risk of manipulation.

## Smart Contract Addresses

### Market Factory

- **Address**: `0x9Fe69930e7b8eD0d3F2E4F911522164A2FC1fb77`
- **Network**: Sei Testnet
- **Chain ID**: 1328

### USDC (Mock USDC, not the official USDC, mint USDC [here](https://predictum.xyz/faucet))

- **Address**: `0xcBaD75B14B9E02af7C36619b6a29aA894eA1356D`
- **Network**: Sei Testnet
- **Chain ID**: 1328

## Architecture

1. **Frontend** sends requests to the **backend** API to resolve the markets
2. **Backend** uses AI to resolve the markets
3. **Smart Contracts** (using EVM-compatible networks) handle decentralized logic for market creation, betting, and settlement.
4. **Subgraph** indexes the blockchain data to provide essential information for the **frontend**

# Prerequisites

- [pnpm](https://pnpm.io/installation) version: >=`9.13.1`
- Version check: `pnpm --version`

Installation of `pnpm`:

```bash
npm install -g pnpm@latest
```

## Setup

Run:

```
make setup
```

## Backend

The **backend** is built using the NestJS framework and interacts with Ethereum-compatible networks. It exposes RESTful endpoint for closing and resolving markets

### Setup

1. **Install dependencies**:

```
pnpm install
```

Configure environment variables:

Rename .env.example to .env.

Start the application:

```
pnpm start or docker compose up
```

The server will run on http://localhost:3001 by default (configurable in .env using the PORT).
Chain Configuration

The application supports multiple chains through dynamic values in the .env. For each chain, you must specify:

```
SEI_TESTNET_WALLET_PRIVATE_KEY= # (optional)
SEI_TESTNET_RPC_URL=
SEI_TESTNET_CHAIN_ID=1328
SEI_TESTNET_CHAIN_NAME="SEI_TESTNET"
```

Make sure to include the chainId as a query parameter when calling the endpoints (e.g. ?chainId=1328).

### API Endpoints

Note: The endpoints **require** the query parameter **chainId** (e.g. ?chainId=1328).

Resolve Market

```
POST /markets/:market?chainId=1328
```

Closes or resolves the market using advanced AI methods

### Development Notes:

Built with NestJS.
Uses viem for blockchain interactions.

## Frontend

Install dependencies:

```
pnpm install
```

Configure environment variables:

Rename .env.example to .env.

Start the application:

```
pnpm start
```

By default, it runs on http://localhost:3000

The frontend includes:

- User Flow: Create a market, place bets, and view existing markets.

- Interaction with the Backend: to close and resolve markets

## Smart Contracts

The core logic for the protocol resides in the smart contracts. These contracts are written in Solidity and can be deployed on any Ethereum-compatible network.

.env.example

```bash
WALLET_PRIVATE_KEY=
RPC_URL=
ETHERSCAN_API_KEY=

# For Deploy script
OWNER=
ORACLE_RESOLVER=
USDC=
```

### MarketFactory (Upgradeable):

- Acts as a factory pattern contract that creates and manages individual Market instances.
- Stores a reference to the Market implementation contract.
- Can create new Market instances using a designated function (e.g., createMarket).
- Keeps track of all created markets for easy enumeration.
- Contains initialization logic for use with a proxy pattern upgrade approach.

### Market:

Each Market instance handles user betting logic:

- Tracks outcomes and user positions.
- Holds liquidity and manages reward distribution.
- Integrates with an oracle to settle the market outcome.

### Market AMM:

- Used to hold all of the math for the smart contracts
