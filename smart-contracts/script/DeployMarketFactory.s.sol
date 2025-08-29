// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {Upgrades} from "openzeppelin-foundry-upgrades/Upgrades.sol";

import {IMarketFactory} from "../contracts/interfaces/IMarketFactory.sol";

import {Market} from "../contracts/Market.sol";
import {MarketAMM} from "../contracts/MarketAMM.sol";
import {MarketFactory} from "../contracts/MarketFactory.sol";
import {CentralizedOracle} from "../contracts/CentralizedOracle.sol";

import {MockERC20} from "../test/helpers/MockERC20.sol";

contract DeployMarketFactory is Script {
    Market public marketImplementation;
    MarketAMM public marketAMMImplementation;
    CentralizedOracle public oracleImplementation;

    function run(address _owner, address _oracleResolver, address _usdc) public returns (MockERC20 usdc, MarketFactory marketFactory) {
        vm.startBroadcast();

        if(block.chainid == 31337) {
            usdc = new MockERC20();
            usdc.mint(msg.sender, 1000 ether);
            _usdc = address(usdc);
        }

        marketImplementation = new Market();
        marketAMMImplementation = new MarketAMM();
        oracleImplementation = new CentralizedOracle();
        
        marketFactory = MarketFactory(
            Upgrades.deployUUPSProxy(
                "MarketFactory.sol",
                abi.encodeCall(
                    MarketFactory.initialize,
                    (
                        IMarketFactory.InitializeArgs(_owner,
                        _oracleResolver,
                        address(marketImplementation),
                        address(marketAMMImplementation),
                        address(oracleImplementation),
                        _usdc)
                    )
                )
            )
        );

        vm.stopBroadcast();
    }
}
