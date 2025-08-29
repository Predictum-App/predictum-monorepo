// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {MarketFactory} from "../contracts/MarketFactory.sol";
import {IOracle} from "../contracts/interfaces/IOracle.sol";

import {MockERC20} from "../test/helpers/MockERC20.sol";

contract CreateMarketScript is Script {
    address constant MARKET_FACTORY_ADDRESS = 0x0165878A594ca255338adfa4d48449f69242Eb8F;
    MockERC20 constant USDC = MockERC20(address(0x5FbDB2315678afecb367f032d93F642f64180aa3));

    function run() public {
        vm.startBroadcast();

        // Create a dynamic array for outcome names
        string[] memory outcomeNames = new string[](2);
        outcomeNames[0] = "yes";
        outcomeNames[1] = "no";

        // Call the createMarket function with the dynamic array
        MarketFactory marketFactory = MarketFactory(MARKET_FACTORY_ADDRESS);
        
        USDC.approve(address(marketFactory), type(uint256).max);
        marketFactory.createMarket(
            "https://www.google.com",
            "Will ETH cross $4000 by August 8 2025?",
            outcomeNames,
            block.timestamp + 20,
            1 ether,
            60,
            50
        );

        vm.stopBroadcast();
    }
}

// forge script script/CreateMarket.s.sol --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
