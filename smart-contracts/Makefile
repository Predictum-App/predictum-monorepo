-include .env
export $(shell sed 's/=.*//' .env)

.PHONY: help all env clean install update build test coverage format deploy\:market-factory deploy\:local setup\:local

DEFAULT_ANVIL_KEY := 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
DEFAULT_ANVIL_ADDRESS := 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
DEFAULT_ANVIL_ADDRESS_1 := 0x70997970C51812dc3A010C7d01b50e0d17dc79C8

DEPLOY_CENTRALIZED_ORACLE := forge script script/DeployCentralizedOracle.s.sol:DeployCentralizedOracle
DEPLOY_MARKET_FACTORY := forge script script/DeployMarketFactory.s.sol:DeployMarketFactory

CLEAN := forge clean
INSTALL_DEPS := rm -rf lib && forge install foundry-rs/forge-std --no-git && forge install OpenZeppelin/openzeppelin-contracts-upgradeable@v5.4.0 --no-git && forge install OpenZeppelin/openzeppelin-foundry-upgrades@v0.4.0 --no-git
UPDATE_DEPS := forge update
BUILD := forge build
TEST := forge test
COVERAGE := forge coverage
FORMAT := forge fmt

help:
	@echo "Usage:"
	@echo "  make help				Shows this help message"
	@echo "  make env				Creates the .env file"
	@echo "  make install				Installs the dependencies"
	@echo "  make update				Updates the dependencies"
	@echo "  make build				Builds the project"
	@echo "  make clean				Cleans the build output"
	@echo "  make test				Runs the tests"
	@echo "  make coverage				Runs the coverage"
	@echo "  make format				Formats the code"
	@echo "  make deploy:market-factory		Deploys the Market Factory contract"
	@echo "  make deploy:local			Deploys the Market Factory contract on local chain"
	@echo "  make setup:local			Sets up the project locally"


all: env clean install update build test coverage format

env :; cp .env.example .env

clean  :; $(CLEAN)

install :; $(INSTALL_DEPS)

update:; $(UPDATE_DEPS)

build:; $(BUILD)

test :; $(TEST)

coverage :; $(COVERAGE)

format :; $(FORMAT)

LOCAL_NETWORK_ARGS := --rpc-url http://localhost:8545 --private-key $(DEFAULT_ANVIL_KEY) --broadcast
DEPLOY_ARGS := --rpc-url $(RPC_URL) --private-key $(WALLET_PRIVATE_KEY) --broadcast -vvvv

# Deploy Market Factory
deploy\:market-factory:
	@echo "Deploying Market Factory contract..."
	$(DEPLOY_MARKET_FACTORY) $(OWNER) $(ORACLE_RESOLVER) $(USDC) --sig 'run(address,address,address)' $(DEPLOY_ARGS)

# Local Setup
deploy\:local:
	@echo "Deployinh up project locally"
	$(BUILD)
	@echo "Deploying Market Factory contract..."
	$(DEPLOY_MARKET_FACTORY) $(OWNER) $(ORACLE_RESOLVER) 0x0000000000000000000000000000000000000000 --sig 'run(address,address,address)' $(LOCAL_NETWORK_ARGS)

# Local Setup
setup\:local:
	@echo "Setting up project locally"
	$(CLEAN)
	$(CLEAR)
	$(INSTALL_DEPS)
	$(BUILD)
	@echo "Deploying Market Factory contract..."
	$(DEPLOY_MARKET_FACTORY) $(OWNER) $(ORACLE_RESOLVER) $(USDC) --sig 'run(address,address,address)' $(LOCAL_NETWORK_ARGS)