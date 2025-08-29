# Prediction Market Configuration

This document outlines the current configuration for the prediction market system.

## Smart Contract Addresses

### Market Factory

- **Address**: `0x9Fe69930e7b8eD0d3F2E4F911522164A2FC1fb77`
- **Network**: Sei Testnet
- **Chain ID**: 1328

### USDC (Mock USDC, not the official USDC, mint USDC [here](https://predictum.xyz/faucet))

- **Address**: `0xcBaD75B14B9E02af7C36619b6a29aA894eA1356D`
- **Network**: Sei Testnet
- **Chain ID**: 1328

## Backend API

### Production Backend

- **URL**: `https://predictions-market-production.up.railway.app`
- **Purpose**: Market resolution, AI-powered outcome determination

## Subgraph (The Graph)

### GraphQL Endpoint

- **URL**: `https://api.goldsky.com/api/public/project_cmegx84k69mkh01ub19g916a1/subgraphs/sei-predict/1.0.1/gn`
- **Purpose**: Indexed blockchain data for efficient market queries
- **Features**:
  - Real-time market data
  - User positions and transactions
  - Market outcomes and resolution status

## 🔧 Configuration Files Updated

### Frontend Configuration

### .env

```bash
#Backend
NEXT_PUBLIC_BACKEND_URL=

#Subgraph
SUBGRAPH_URL=

# Smart Contract Addresses
NEXT_PUBLIC_MARKET_FACTORY_ADDRESS=

# WalletConnect Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=

# Pinata
PINATA_JWT=
```

### Backend Configuration

The backend uses environment variables for configuration. Key variables needed:

```bash
# Wallet Configuration
WALLET_PRIVATE_KEY=

# Perplexity for AI resolution
PERPLEXITY_API_KEY=

# Chain Configuration
SEI_TESTNET_CHAIN_NAME="Sei Testnet"
SEI_TESTNET_RPC_URL=
SEI_TESTNET_CHAIN_ID=1328
```

## Getting Started

### 0. Root directory

### Install dependencies for projects

```bash
pnpm install
```

### 1. Frontend Setup

```bash
cd frontend
pnpm dev
```

### 2. Backend Setup

```bash
cd backend
# Set up environment variables
pnpm start:dev
```

### 3. Testing the Configuration

#### Test Market Factory Connection

1. Connect MetaMask to Sei Testnet
2. Visit the frontend application
3. Fetch the markets, create new one and start trading

#### Test Backend Resolution

1. Create a test market
2. Wait for it to close
3. Trigger resolution via the backend API
