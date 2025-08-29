// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {console2} from "forge-std/console2.sol";

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {MockERC20} from "./helpers/MockERC20.sol";

import "../contracts/errors/CommonErrors.sol";
import "../contracts/errors/MarketErrors.sol";

import {IMarket} from "../contracts/interfaces/IMarket.sol";
import {IMarketAMM} from "../contracts/interfaces/IMarketAMM.sol";
import {IOracle} from "../contracts/interfaces/IOracle.sol";

import {MarketAMM} from "../contracts/MarketAMM.sol";
import {Market} from "../contracts/Market.sol";
import {CentralizedOracle} from "../contracts/CentralizedOracle.sol";

contract MarketTest is Test {
    using Math for uint256;

    uint256 constant BPS = 10000;

    address oracleImplementation;
    address marketImplementation;
    IMarketAMM marketAMM;
    CentralizedOracle oracle;
    Market market;
    ERC20 USDC;

    address creator = makeAddr("John");
    address bob = makeAddr("Bob");
    address alice = makeAddr("Alice");

    function setUp() public {
        marketAMM = new MarketAMM();
        oracleImplementation = address(new CentralizedOracle());
        marketImplementation = address(new Market());
        USDC = new MockERC20();

        oracle = CentralizedOracle(Clones.clone(oracleImplementation));
        market = Market(Clones.clone(marketImplementation));

        IMarket.MarketInfoInput memory marketInfo = IMarket.MarketInfoInput({
            marketURI: "test",
            question: "Will it rain today?",
            outcomeNames: new string[](2),
            closeTime: block.timestamp + 1 days,
            creator: creator,
            resolveDelay: 1 minutes,
            feeBPS: 200
        });
        marketInfo.outcomeNames[0] = "Yes";
        marketInfo.outcomeNames[1] = "No";
        uint256 initialLiquidity = 1000e6;

        uint256[] memory outcomePrices = new uint256[](2);
        outcomePrices[0] = 0.5e6;
        outcomePrices[1] = 0.5e6;

        deal(address(USDC), creator, 1000e6);
        vm.prank(creator);
        USDC.approve(address(market), 1000e6);
        vm.prank(creator);
        market.initialize(marketInfo, oracle, marketAMM, initialLiquidity, address(USDC));

        oracle.initialize(creator);
    }

    function resolveMarket(IMarket _market) private {
        vm.warp(_market.getInfo().closeTime + 2 days);
        _market.closeMarket();
        skip(_market.getResolveDelay());

        vm.prank(creator);
        oracle.setOutcome(0);
        _market.resolveMarket();
    }

    function assertInvariant(IMarket _market) public view {
        IMarket.MarketPoolData memory poolData = _market.getPoolData();
        (,, uint256[] memory poolShares) = _market.getOutcomes();

        assertApproxEqAbs(Math.sqrt(poolShares[0] * poolShares[1]), poolData.liquidity, 1e4);
    }

    function assertTotalAvailableShares(IMarket _market) public view {
        IMarket.MarketPoolData memory poolData = _market.getPoolData();
        assertEq(
            poolData.totalAvailableShares, poolData.outcomes[0].shares.available + poolData.outcomes[1].shares.available
        );
    }

    function assertMarketBalance(IMarket _market) public view {
        IMarket.MarketPoolData memory poolData = _market.getPoolData();
        assertEq(USDC.balanceOf(address(_market)) >= poolData.balance, true);
        for (uint256 i = 0; i < poolData.outcomes.length; ++i) {
            assertEq(poolData.balance >= poolData.outcomes[i].shares.total, true);
        }
    }

    /*//////////////////////////////////////////////////////////////
                            initialize
    //////////////////////////////////////////////////////////////*/
    function test_initialize_initializes_correctly() external view {
        // Assert
        assertEq(market.resolveDelay(), 1 minutes);

        /// Assert market info
        IMarket.MarketInfo memory info = market.getInfo();
        assertEq(info.question, "Will it rain today?");
        assertEq(info.outcomeCount, 2);
        assertEq(info.closeTime, block.timestamp + 1 days);
        assertEq(info.createTime, block.timestamp);
        assertEq(info.closedAt, 0);

        /// Assert pool data
        IMarket.MarketPoolData memory poolData = market.getPoolData();
        assertEq(poolData.balance, 1000e6);
        assertEq(poolData.liquidity, 1000e6);
        assertEq(poolData.totalAvailableShares, 1000e6 * 2);

        /// Assert outcomes
        (string[] memory names, uint256[] memory totalShares, uint256[] memory poolShares) = market.getOutcomes();
        assert(names.length == 2);
        assertEq(names[0], "Yes");
        assertEq(names[1], "No");

        assert(totalShares.length == 2);
        assertEq(totalShares[0], 1000e6);
        assertEq(totalShares[1], 1000e6);

        assert(poolShares.length == 2);
        assertEq(poolShares[0], 1000e6);
        assertEq(poolShares[1], 1000e6);
        assert(poolData.totalAvailableShares == poolShares[0] + poolShares[1]);

        /// Assert state
        assert(market.state() == IMarket.MarketState.open);

        /// Assert addresses
        assertEq(market.creator(), creator);
        assertEq(address(market.oracle()), address(oracle));
        assertEq(address(market.marketAMM()), address(marketAMM));

        /// Assert balances
        uint256[] memory creatorOutcomeShares = market.getUserOutcomeShares(creator);
        assertEq(creatorOutcomeShares[0], 0);
        assertEq(creatorOutcomeShares[1], 0);

        uint256 creatorLiquidityShares = market.getUserLiquidityShares(creator);
        assertEq(creatorLiquidityShares, 1000e6);

        /// Assert fees
        assertEq(market.getFeeBPS(), 200);

        assertInvariant(market);
        assertTotalAvailableShares(market);
        assertMarketBalance(market);
    }

    function test_initialize_reverts_when_already_initialized() external {
        // Arrange
        IMarket.MarketInfoInput memory marketInfo = IMarket.MarketInfoInput({
            marketURI: "test",
            question: "Will it rain today?",
            outcomeNames: new string[](0),
            closeTime: block.timestamp + 1 days,
            creator: creator,
            resolveDelay: 1 minutes,
            feeBPS: 0
        });
        uint256 initialLiquidity = 1000e6;

        // Act & Assert
        vm.expectRevert(Initializable.InvalidInitialization.selector);
        market.initialize(marketInfo, oracle, IMarketAMM(address(0)), initialLiquidity, address(USDC));
    }

    function test_initialize_reverts_on_invalid_close_time() external {
        // Arrange
        IMarket.MarketInfoInput memory marketInfo = IMarket.MarketInfoInput({
            marketURI: "test",
            question: "Will it rain today?",
            outcomeNames: new string[](2),
            closeTime: block.timestamp - 1,
            creator: creator,
            resolveDelay: 1 minutes,
            feeBPS: 0
        });
        marketInfo.outcomeNames[0] = "Yes";
        marketInfo.outcomeNames[1] = "No";
        uint256 initialLiquidity = 1000e6;
        Market clone = Market(Clones.clone(marketImplementation));

        // Act & Assert
        vm.expectRevert(InvalidCloseTime.selector);
        clone.initialize(marketInfo, oracle, IMarketAMM(address(0)), initialLiquidity, address(USDC));
    }

    function test_initialize_reverts_when_outcomes_length_not_2() external {
        // Arrange
        IMarket.MarketInfoInput memory marketInfo = IMarket.MarketInfoInput({
            marketURI: "test",
            question: "Will it rain today?",
            outcomeNames: new string[](0),
            closeTime: block.timestamp + 1,
            creator: creator,
            resolveDelay: 1 minutes,
            feeBPS: 0
        });
        uint256 initialLiquidity = 1000e6;
        Market clone = Market(Clones.clone(marketImplementation));

        // Act & Assert
        vm.expectRevert(OnlyBinaryMarketSupported.selector);
        clone.initialize(marketInfo, oracle, IMarketAMM(address(0)), initialLiquidity, address(USDC));
    }

    function test_initialize_reverts_on_zero_addresses() external {
        // Arrange
        IMarket.MarketInfoInput memory marketInfo = IMarket.MarketInfoInput({
            marketURI: "test",
            question: "Will it rain today?",
            outcomeNames: new string[](2),
            closeTime: block.timestamp + 1,
            creator: creator,
            resolveDelay: 1 minutes,
            feeBPS: 0
        });
        uint256 initialLiquidity = 1000e6;
        Market clone = Market(Clones.clone(marketImplementation));

        // Act & Assert
        vm.expectRevert(ZeroAddress.selector);
        clone.initialize(marketInfo, oracle, IMarketAMM(address(0)), initialLiquidity, address(USDC));

        vm.expectRevert(ZeroAddress.selector);
        clone.initialize(marketInfo, oracle, IMarketAMM(address(0)), initialLiquidity, address(USDC));

        marketInfo.creator = address(0);
        vm.expectRevert(ZeroAddress.selector);
        clone.initialize(marketInfo, oracle, IMarketAMM(address(0)), initialLiquidity, address(USDC));
    }

    function test_initialize_reverts_on_incorrect_resolve_delay() external {
        // Arrange
        IMarket.MarketInfoInput memory marketInfo = IMarket.MarketInfoInput({
            marketURI: "test",
            question: "Will it rain today?",
            outcomeNames: new string[](2),
            closeTime: block.timestamp + 1,
            creator: creator,
            resolveDelay: 1 minutes,
            feeBPS: 0
        });
        marketInfo.outcomeNames[0] = "Yes";
        marketInfo.outcomeNames[1] = "No";
        uint256 initialLiquidity = 1000e6;
        Market clone = Market(Clones.clone(marketImplementation));

        // Act & Assert
        marketInfo.resolveDelay = 0;
        vm.expectRevert(abi.encodeWithSelector(InvalidResolveDelay.selector, 1 minutes, 7 days));
        clone.initialize(marketInfo, oracle, IMarketAMM(address(0)), initialLiquidity, address(USDC));

        marketInfo.resolveDelay = 8 days;
        vm.expectRevert(abi.encodeWithSelector(InvalidResolveDelay.selector, 1 minutes, 7 days));
        clone.initialize(marketInfo, oracle, IMarketAMM(address(0)), initialLiquidity, address(USDC));
    }

    function test_initialize_reverts_on_invalid_fee_bps() external {
        // Arrange
        IMarket.MarketInfoInput memory marketInfo = IMarket.MarketInfoInput({
            marketURI: "test",
            question: "Will it rain today?",
            outcomeNames: new string[](2),
            closeTime: block.timestamp + 1,
            creator: creator,
            resolveDelay: 1 minutes,
            feeBPS: 10001
        });
        marketInfo.outcomeNames[0] = "Yes";
        marketInfo.outcomeNames[1] = "No";
        uint256 initialLiquidity = 1000e6;
        Market clone = Market(Clones.clone(marketImplementation));

        // Act & Assert
        vm.expectRevert(InvalidFeeBPS.selector);
        clone.initialize(marketInfo, oracle, marketAMM, initialLiquidity, address(USDC));
    }

    /*//////////////////////////////////////////////////////////////
                            addLiquidity
    //////////////////////////////////////////////////////////////*/
    function test_addLiquidity_receive_only_lp_shares_on_equal_market() external {
        // Arrange
        uint256 amount = 50e6;

        IMarket.MarketPoolData memory prePoolData = market.getPoolData();
        (, uint256[] memory preTotalShares, uint256[] memory prePoolShares) = market.getOutcomes();

        // Act
        deal(address(USDC), bob, amount);
        vm.prank(bob);
        USDC.approve(address(market), amount);
        vm.prank(bob);
        market.addLiquidity(amount, block.timestamp + 1);

        // Assert
        IMarket.MarketPoolData memory poolData = market.getPoolData();

        (, uint256[] memory totalShares, uint256[] memory poolShares) = market.getOutcomes();

        uint256[] memory bobOutcomeShares = market.getUserOutcomeShares(bob);

        uint256 creatorLiquidityShares = market.getUserLiquidityShares(creator);
        uint256 bobLiquidityShares = market.getUserLiquidityShares(bob);

        /// Assert Balance
        assertEq(poolData.balance, prePoolData.balance + amount);

        /// Assert Liquidity Value
        assertEq(poolData.liquidity, prePoolData.liquidity + amount);
        assertEq(poolData.liquidity, creatorLiquidityShares + bobLiquidityShares);

        /// Assert Total Outcome Shares
        assertEq(poolData.totalAvailableShares, prePoolData.totalAvailableShares + (amount * 2));
        assertEq(totalShares[0], preTotalShares[0] + amount);
        assertEq(totalShares[1], preTotalShares[1] + amount);

        /// Assert Pool Shares
        assertEq(poolShares[0], prePoolShares[0] + amount);
        assertEq(poolShares[1], prePoolShares[1] + amount);

        /// Assert User Outcome Shares
        assertEq(bobOutcomeShares[0], 0);
        assertEq(bobOutcomeShares[1], 0);

        /// Assert User Liquidity Shares
        assertEq(bobLiquidityShares, 50e6);

        assertInvariant(market);
        assertTotalAvailableShares(market);
        assertMarketBalance(market);
    }

    function test_addLiquidity_receive_lp_and_less_likey_outcome_shares_on_unequal_market() external {
        // Arrange
        uint256 buyAmount = 100e6;
        uint256 outComeIndex = 0;
        deal(address(USDC), alice, buyAmount);
        vm.prank(alice);
        USDC.approve(address(market), buyAmount);
        vm.prank(alice);
        market.buyShares(buyAmount, outComeIndex, 0, block.timestamp + 1);
        uint256 amount = 500e6;

        IMarket.MarketPoolData memory prePoolData = market.getPoolData();
        (, uint256[] memory preTotalShares, uint256[] memory prePoolShares) = market.getOutcomes();

        // Act
        deal(address(USDC), bob, amount);
        vm.prank(bob);
        USDC.approve(address(market), amount);
        vm.prank(bob);
        market.addLiquidity(amount, block.timestamp + 1);

        // Assert
        IMarket.MarketPoolData memory poolData = market.getPoolData();
        (, uint256[] memory totalShares, uint256[] memory poolShares) = market.getOutcomes();

        uint256[] memory bobOutcomeShares = market.getUserOutcomeShares(bob);

        uint256 creatorLiquidityShares = market.getUserLiquidityShares(creator);
        uint256 bobLiquidityShares = market.getUserLiquidityShares(bob);

        /// Assert Balance
        assertEq(poolData.balance, prePoolData.balance + amount);

        /// Assert Liquidity Value
        assertEq(poolData.liquidity, prePoolData.liquidity + bobLiquidityShares);
        assertEq(poolData.liquidity, creatorLiquidityShares + bobLiquidityShares);

        /// Assert Total Outcome Shares
        assertEq(poolData.totalAvailableShares, prePoolData.totalAvailableShares + (amount * 2) - bobOutcomeShares[0]);
        assertEq(totalShares[0], preTotalShares[0] + amount);
        assertEq(totalShares[1], preTotalShares[1] + amount);

        /// Assert Pool Shares
        assertEq(poolShares[0], prePoolShares[0] + amount - bobOutcomeShares[0]);
        assertEq(poolShares[1], prePoolShares[1] + amount);

        /// Assert User Outcome Shares
        assertGe(bobOutcomeShares[0], 0);
        assertEq(bobOutcomeShares[1], 0);

        /// Assert User Liquidity Shares
        assertGe(bobLiquidityShares, 0);
        assertLe(bobLiquidityShares, 500e6);

        assertInvariant(market);
        assertTotalAvailableShares(market);
        assertMarketBalance(market);
    }

    function test_addLiquidity_reverts_on_deadline_passed() external {
        // Arrange
        uint256 amount = 500e6;

        // Act & Assert
        vm.expectRevert(DeadlinePassed.selector);
        market.addLiquidity(amount, block.timestamp - 1);
    }

    function test_addLiquidity_reverts_on_close_time_passed() external {
        // Arrange
        uint256 amount = 500e6;
        vm.warp(block.timestamp + 2 days);

        // Act & Assert
        vm.expectRevert(MarketClosed.selector);
        market.addLiquidity(amount, block.timestamp + 2);
    }

    function test_addLiquidity_reverts_on_closed_market() external {
        // Arrange
        uint256 amount = 500e6;
        vm.warp(2 days);
        market.closeMarket();

        // Act & Assert
        vm.expectRevert(MarketClosed.selector);
        market.addLiquidity(amount, block.timestamp + 1);
    }

    /*//////////////////////////////////////////////////////////////
                            buyShares
    //////////////////////////////////////////////////////////////*/
    function test_buyShares_correctly_buys_shares() external {
        // Arrange
        uint256 amount = 300e6;
        uint256 amountAfterFee = amount - (amount * market.getFeeBPS()) / BPS;
        uint256 outcomeIndex = 0;

        IMarket.MarketPoolData memory prePoolData = market.getPoolData();
        (, uint256[] memory preTotalShares, uint256[] memory prePoolShares) = market.getOutcomes();

        // Act
        deal(address(USDC), bob, amount);
        vm.prank(bob);
        USDC.approve(address(market), amount);
        vm.prank(bob);
        market.buyShares(amount, outcomeIndex, 0, block.timestamp + 1);

        // Assert
        IMarket.MarketPoolData memory poolData = market.getPoolData();
        (, uint256[] memory totalShares, uint256[] memory poolShares) = market.getOutcomes();

        uint256[] memory bobOutcomeShares = market.getUserOutcomeShares(bob);

        /// Assert Balance
        assertEq(poolData.balance, prePoolData.balance + amountAfterFee);

        /// Assert Liquidity Value
        assertEq(poolData.liquidity, prePoolData.liquidity);

        /// Assert Total Outcome Shares
        assertEq(
            poolData.totalAvailableShares, prePoolData.totalAvailableShares + (amountAfterFee * 2) - bobOutcomeShares[0]
        );
        assertEq(totalShares[0], preTotalShares[0] + amountAfterFee);
        assertEq(totalShares[1], preTotalShares[1] + amountAfterFee);

        /// Assert Pool Shares
        assertEq(poolShares[0] + bobOutcomeShares[0], totalShares[0]);
        assertEq(poolShares[1] + bobOutcomeShares[1], totalShares[1]);
        assertEq(prePoolShares[1], poolShares[1] - amountAfterFee);

        /// Assert User Outcome Shares
        assertGe(bobOutcomeShares[0], 0);
        assertApproxEqAbs(bobOutcomeShares[0], 521.12 * (10 ** 6), 1e6);
        assertEq(bobOutcomeShares[1], 0);

        /// Assert User Liquidity Shares
        assertEq(market.getUserLiquidityShares(bob), 0);

        assertInvariant(market);
        assertTotalAvailableShares(market);
        assertMarketBalance(market);
    }

    function test_buyShares_multiple_buyers(uint256 aliceAmount, uint256 bobAmount) external {
        // Arrange
        aliceAmount = bound(aliceAmount, 1, 9999999e6);
        bobAmount = bound(bobAmount, 1, 9999999e6);

        uint256 aliceAmountAfterFee = aliceAmount - (aliceAmount * market.getFeeBPS()) / BPS;
        uint256 bobAmountAfterFee = bobAmount - (bobAmount * market.getFeeBPS()) / BPS;

        IMarket.MarketPoolData memory prePoolData = market.getPoolData();
        (, uint256[] memory preTotalShares, uint256[] memory prePoolShares) = market.getOutcomes();

        // Act
        deal(address(USDC), bob, bobAmount);
        vm.prank(bob);
        USDC.approve(address(market), bobAmount);
        vm.prank(bob);
        market.buyShares(bobAmount, 0, 0, block.timestamp + 1);

        deal(address(USDC), alice, aliceAmount);
        vm.prank(alice);
        USDC.approve(address(market), aliceAmount);
        vm.prank(alice);
        market.buyShares(aliceAmount, 0, 0, block.timestamp + 1);

        // Assert
        IMarket.MarketPoolData memory poolData = market.getPoolData();
        (, uint256[] memory totalShares, uint256[] memory poolShares) = market.getOutcomes();

        /// Assert Balance
        assertEq(poolData.balance, prePoolData.balance + aliceAmountAfterFee + bobAmountAfterFee);

        /// Assert Liquidity Value
        assertEq(poolData.liquidity, prePoolData.liquidity);

        /// Assert Total Outcome Shares
        assertEq(
            poolData.totalAvailableShares,
            prePoolData.totalAvailableShares + (aliceAmountAfterFee * 2) + (bobAmountAfterFee * 2)
                - (market.getUserOutcomeShares(alice)[0] + market.getUserOutcomeShares(bob)[0])
        );
        assertEq(totalShares[0], preTotalShares[0] + (aliceAmountAfterFee + bobAmountAfterFee));
        assertEq(totalShares[1], preTotalShares[1] + (aliceAmountAfterFee + bobAmountAfterFee));

        /// Assert Pool Shares
        assertEq(
            poolShares[0] + market.getUserOutcomeShares(bob)[0] + market.getUserOutcomeShares(alice)[0], totalShares[0]
        );
        assertEq(
            poolShares[1] + market.getUserOutcomeShares(bob)[1] + market.getUserOutcomeShares(alice)[1], totalShares[1]
        );
        assertEq(prePoolShares[1], poolShares[1] - (aliceAmountAfterFee + bobAmountAfterFee));

        /// Assert User Outcome Shares
        assertGe(market.getUserOutcomeShares(bob)[0], 0);
        assertEq(market.getUserOutcomeShares(bob)[1], 0);

        assertGe(market.getUserOutcomeShares(alice)[0], 0);
        assertEq(market.getUserOutcomeShares(alice)[1], 0);

        assertInvariant(market);
        assertTotalAvailableShares(market);
        assertMarketBalance(market);
    }

    function test_buyShares_reverts_on_invalid_outcome_index() external {
        // Arrange
        uint256 amount = 300e6;
        uint256 outcomeIndex = 2;

        // Act & Assert
        deal(address(USDC), bob, amount);
        vm.prank(bob);
        USDC.approve(address(market), amount);
        vm.prank(bob);
        vm.expectRevert();
        market.buyShares(amount, outcomeIndex, 300e6, block.timestamp + 1);
    }

    function test_buyShares_reverts_on_deadline_passed() external {
        // Arrange
        uint256 amount = 300e6;
        uint256 outcomeIndex = 0;

        // Act & Assert
        deal(address(USDC), bob, amount);
        vm.prank(bob);
        USDC.approve(address(market), amount);
        vm.prank(bob);
        vm.expectRevert(DeadlinePassed.selector);
        market.buyShares(amount, outcomeIndex, 300e6, block.timestamp - 1);
    }

    function test_buyShares_reverts_on_slippage() external {
        // Arrange
        uint256 amount = 300e6;
        uint256 outcomeIndex = 0;

        // Act & Assert
        deal(address(USDC), bob, amount);
        vm.prank(bob);
        USDC.approve(address(market), amount);
        vm.prank(bob);
        vm.expectRevert(MinimumSharesNotMet.selector);
        market.buyShares(amount, outcomeIndex, 1000e6, block.timestamp + 1);
    }

    function test_buyShares_reverts_on_close_time_passed() external {
        // Arrange
        uint256 amount = 300e6;
        uint256 outcomeIndex = 0;
        vm.warp(block.timestamp + 2 days);

        // Act & Assert
        deal(address(USDC), bob, amount);
        vm.prank(bob);
        USDC.approve(address(market), amount);
        vm.prank(bob);
        vm.expectRevert(MarketClosed.selector);
        market.buyShares(amount, outcomeIndex, 300e6, block.timestamp + 2);
    }

    function test_buyShares_reverts_on_closed_market() external {
        // Arrange
        uint256 amount = 300e6;
        uint256 outcomeIndex = 0;
        vm.warp(2 days);
        market.closeMarket();

        // Act & Assert
        deal(address(USDC), bob, amount);
        vm.prank(bob);
        USDC.approve(address(market), amount);
        vm.prank(bob);
        vm.expectRevert(MarketClosed.selector);
        market.buyShares(amount, outcomeIndex, 300e6, block.timestamp + 1);
    }

    /*//////////////////////////////////////////////////////////////
                            sellShares
    //////////////////////////////////////////////////////////////*/
    function test_sellShares_correctly_sells_shares() external {
        // Arrange
        uint256 amount = 100e6;
        uint256 amountAfterFee = amount - (amount * market.getFeeBPS()) / BPS;
        uint256 outcomeIndex = 0;

        IMarket.MarketPoolData memory preBuyPoolData = market.getPoolData();
        (, uint256[] memory preBuyTotalShares, uint256[] memory preBuyPoolShares) = market.getOutcomes();

        deal(address(USDC), bob, amount);
        vm.prank(bob);
        USDC.approve(address(market), amount);
        vm.prank(bob);
        market.buyShares(amount, outcomeIndex, 0, block.timestamp + 1);

        IMarket.MarketPoolData memory preSellPoolData = market.getPoolData();
        (, uint256[] memory preSellTotalShares, uint256[] memory preSellPoolShares) = market.getOutcomes();
        uint256[] memory bobPreSellOutcomeShares = market.getUserOutcomeShares(bob);
        console2.log("Bob after buy", bobPreSellOutcomeShares[0]);

        vm.expectEmit(true, false, false, false);
        emit IMarket.SharesSold(bob, outcomeIndex, 0, 0, 0, new uint256[](2)); // Does not check the values

        // Act
        vm.prank(bob);
        market.sellShares(bobPreSellOutcomeShares[0], outcomeIndex, 0, block.timestamp + 1);

        // Assert
        IMarket.MarketPoolData memory poolData = market.getPoolData();
        (, uint256[] memory totalShares, uint256[] memory poolShares) = market.getOutcomes();

        /// Assert Balance
        assertEq(poolData.balance, preBuyPoolData.balance);
        assertEq(poolData.balance, preSellPoolData.balance - amountAfterFee);
        assertEq(poolData.balance, 1000e6);

        /// Assert Liquidity Value
        assertEq(poolData.liquidity, preBuyPoolData.liquidity);
        assertEq(poolData.liquidity, preSellPoolData.liquidity);
        assertEq(poolData.liquidity, 1000e6);

        /// Assert Total Outcome Shares
        assertEq(poolData.totalAvailableShares, preBuyPoolData.totalAvailableShares);
        assertEq(
            poolData.totalAvailableShares,
            preSellPoolData.totalAvailableShares - (amountAfterFee * 2) + bobPreSellOutcomeShares[0]
        );
        assertEq(totalShares[0], preSellTotalShares[0] - amountAfterFee);
        assertEq(totalShares[1], preSellTotalShares[1] - amountAfterFee);
        assertEq(totalShares[0], preBuyTotalShares[0]);
        assertEq(totalShares[1], preBuyTotalShares[1]);
        assertEq(totalShares[0], 1000e6);
        assertEq(totalShares[0], 1000e6);
        assertEq(poolData.totalAvailableShares, 2000e6);

        /// Assert Pool Shares
        assertEq(poolShares[0] + market.getUserOutcomeShares(bob)[0], totalShares[0]);
        assertEq(poolShares[1] + market.getUserOutcomeShares(bob)[1], totalShares[1]);
        assertEq(preBuyPoolShares[0], poolShares[0]);
        assertEq(preBuyPoolShares[1], poolShares[1]);
        assertEq(poolShares[0], preSellPoolShares[0] + bobPreSellOutcomeShares[0] - amountAfterFee);
        assertEq(poolShares[1], preSellPoolShares[1] - amountAfterFee);
        assertEq(poolShares[0], 1000e6);
        assertEq(poolShares[0], 1000e6);

        /// Assert User Outcome Shares
        assertEq(market.getUserOutcomeShares(bob)[0], 0);
        assertEq(market.getUserOutcomeShares(bob)[1], 0);

        /// Assert User Liquidity Shares
        assertEq(market.getUserLiquidityShares(bob), 0);

        assertInvariant(market);
        assertTotalAvailableShares(market);
        assertMarketBalance(market);
    }

    function test_sellShares_correctly_sells_shares_big_amount() external {
        // Arrange
        uint256 amount = 10000e6;
        uint256 amountAfterFee = amount - (amount * market.getFeeBPS()) / BPS;
        uint256 outcomeIndex = 0;

        IMarket.MarketPoolData memory preBuyPoolData = market.getPoolData();
        (, uint256[] memory preBuyTotalShares, uint256[] memory preBuyPoolShares) = market.getOutcomes();

        deal(address(USDC), bob, amount);
        vm.prank(bob);
        USDC.approve(address(market), amount);
        vm.prank(bob);
        market.buyShares(amount, outcomeIndex, 0, block.timestamp + 1);

        IMarket.MarketPoolData memory preSellPoolData = market.getPoolData();
        (, uint256[] memory preSellTotalShares, uint256[] memory preSellPoolShares) = market.getOutcomes();
        uint256[] memory bobPreSellOutcomeShares = market.getUserOutcomeShares(bob);
        assertApproxEqAbs(bobPreSellOutcomeShares[0], 10707.40747 * (10 ** 6), 0.0001 * (10 ** 6));

        // Act
        vm.prank(bob);
        market.sellShares(bobPreSellOutcomeShares[0], outcomeIndex, 0, block.timestamp + 1);

        // Assert
        IMarket.MarketPoolData memory poolData = market.getPoolData();
        (, uint256[] memory totalShares, uint256[] memory poolShares) = market.getOutcomes();

        /// Assert Balance
        assertEq(poolData.balance, preBuyPoolData.balance);
        assertEq(poolData.balance, preSellPoolData.balance - amountAfterFee);
        assertEq(poolData.balance, 1000e6);

        /// Assert Liquidity Value
        assertEq(poolData.liquidity, preBuyPoolData.liquidity);
        assertEq(poolData.liquidity, preSellPoolData.liquidity);
        assertEq(poolData.liquidity, 1000e6);

        /// Assert Total Outcome Shares
        assertEq(poolData.totalAvailableShares, preBuyPoolData.totalAvailableShares);
        assertEq(
            poolData.totalAvailableShares,
            preSellPoolData.totalAvailableShares + bobPreSellOutcomeShares[0] - (amountAfterFee * 2)
        );

        assertEq(totalShares[0], preSellTotalShares[0] - amountAfterFee);
        assertEq(totalShares[1], preSellTotalShares[1] - amountAfterFee);
        assertEq(totalShares[0], preBuyTotalShares[0]);
        assertEq(totalShares[1], preBuyTotalShares[1]);
        assertEq(totalShares[0], 1000e6);
        assertEq(totalShares[0], 1000e6);
        assertEq(poolData.totalAvailableShares, 2000e6);

        /// Assert Pool Shares
        assertEq(poolShares[0] + market.getUserOutcomeShares(bob)[0], totalShares[0]);
        assertEq(poolShares[1] + market.getUserOutcomeShares(bob)[1], totalShares[1]);
        assertEq(preBuyPoolShares[0], poolShares[0]);
        assertEq(preBuyPoolShares[1], poolShares[1]);
        assertEq(poolShares[0], preSellPoolShares[0] + bobPreSellOutcomeShares[0] - amountAfterFee);
        assertEq(poolShares[1], preSellPoolShares[1] - amountAfterFee);
        assertEq(poolShares[0], 1000e6);
        assertEq(poolShares[0], 1000e6);

        /// Assert User Outcome Shares
        assertEq(market.getUserOutcomeShares(bob)[0], 0);
        assertEq(market.getUserOutcomeShares(bob)[1], 0);

        /// Assert User Liquidity Shares
        assertEq(market.getUserLiquidityShares(bob), 0);

        assertInvariant(market);
        assertTotalAvailableShares(market);
        assertMarketBalance(market);
    }

    function test_fuzz_sellShares_correctly_sells_shares(uint256 amount) external {
        // Arrange
        IMarket.MarketPoolData memory preBuyPoolData = market.getPoolData();
        (, uint256[] memory preBuyTotalShares, uint256[] memory preBuyPoolShares) = market.getOutcomes();

        amount = bound(amount, 1, 999999999999999e6);
        uint256 amountAfterFee = amount - (amount * market.getFeeBPS()) / BPS;
        uint256 outcomeIndex = 0;

        deal(address(USDC), bob, amount);
        vm.prank(bob);
        USDC.approve(address(market), amount);
        vm.prank(bob);
        market.buyShares(amount, outcomeIndex, 0, block.timestamp + 1);

        IMarket.MarketPoolData memory preSellPoolData = market.getPoolData();
        (, uint256[] memory preSellTotalShares, uint256[] memory preSellPoolShares) = market.getOutcomes();
        uint256[] memory bobPreSellOutcomeShares = market.getUserOutcomeShares(bob);

        // Act
        vm.prank(bob);
        market.sellShares(bobPreSellOutcomeShares[0], outcomeIndex, 0, block.timestamp + 1);

        // Assert
        IMarket.MarketPoolData memory poolData = market.getPoolData();
        (, uint256[] memory totalShares, uint256[] memory poolShares) = market.getOutcomes();

        /// Assert Balance
        assertEq(poolData.balance, preBuyPoolData.balance);
        assertEq(poolData.balance, preSellPoolData.balance - amountAfterFee);

        /// Assert Liquidity Value
        assertEq(poolData.liquidity, preBuyPoolData.liquidity);
        assertEq(poolData.liquidity, preSellPoolData.liquidity);

        /// Assert Total Outcome Shares
        assertEq(poolData.totalAvailableShares, preBuyPoolData.totalAvailableShares);
        assertEq(
            poolData.totalAvailableShares,
            preSellPoolData.totalAvailableShares + bobPreSellOutcomeShares[0] - (amountAfterFee * 2)
        );
        assertEq(totalShares[0], preSellTotalShares[0] - amountAfterFee);
        assertEq(totalShares[1], preSellTotalShares[1] - amountAfterFee);
        assertEq(totalShares[0], preBuyTotalShares[0]);
        assertEq(totalShares[1], preBuyTotalShares[1]);

        /// Assert Pool Shares
        assertEq(poolShares[0] + market.getUserOutcomeShares(bob)[0], totalShares[0]);
        assertEq(poolShares[1] + market.getUserOutcomeShares(bob)[1], totalShares[1]);
        assertEq(preBuyPoolShares[0], poolShares[0]);
        assertEq(preBuyPoolShares[1], poolShares[1]);
        assertEq(poolShares[0], preSellPoolShares[0] + bobPreSellOutcomeShares[0] - amountAfterFee);
        assertEq(poolShares[1], preSellPoolShares[1] - amountAfterFee);

        /// Assert User Outcome Shares
        assertEq(market.getUserOutcomeShares(bob)[0], 0);
        assertEq(market.getUserOutcomeShares(bob)[1], 0);

        /// Assert User Liquidity Shares
        assertEq(market.getUserLiquidityShares(bob), 0);

        assertInvariant(market);
        assertTotalAvailableShares(market);
        assertMarketBalance(market);
    }

    function test_sellShares_reverts_on_insufficient_share() external {
        // Arrange
        uint256 shares = 100e6;
        uint256 outcomeIndex = 0;

        // Act & Assert
        vm.prank(bob);
        vm.expectRevert(InsufficientShares.selector);
        market.sellShares(shares + 1, outcomeIndex, 0, block.timestamp + 1);
    }

    function test_sellShares_reverts_on_invalid_outcome_index() external {
        // Arrange
        uint256 shares = 100e6;
        uint256 outcomeIndex = 2;

        // Act & Assert
        vm.prank(bob);
        vm.expectRevert();
        market.sellShares(shares, outcomeIndex, 0, block.timestamp + 1);
    }

    function test_sellShares_reverts_on_deadline_passed() external {
        // Arrange
        uint256 shares = 100e6;
        uint256 outcomeIndex = 0;

        // Act & Assert
        vm.prank(bob);
        vm.expectRevert(DeadlinePassed.selector);
        market.sellShares(shares, outcomeIndex, 0, block.timestamp - 1);
    }

    function test_sellShares_reverts_on_slippage() external {
        // Arrange
        uint256 amount = 100e6;
        uint256 outcomeIndex = 0;

        // First give bob some shares to sell
        deal(address(USDC), bob, amount);
        vm.prank(bob);
        USDC.approve(address(market), amount);
        vm.prank(bob);
        market.buyShares(amount, outcomeIndex, 0, block.timestamp + 1);

        uint256[] memory bobOutcomeShares = market.getUserOutcomeShares(bob);

        // Act & Assert - try to sell shares but require more ETH than possible due to slippage
        vm.prank(bob);
        vm.expectRevert(MinReceiveAmountNotMet.selector);
        market.sellShares(bobOutcomeShares[0], outcomeIndex, amount + 1, block.timestamp + 1);
    }

    function test_sellShares_reverts_on_close_time_passed() external {
        // Arrange
        uint256 shares = 100e6;
        uint256 outcomeIndex = 0;
        vm.warp(block.timestamp + 2 days);

        // Act & Assert
        vm.prank(bob);
        vm.expectRevert(MarketClosed.selector);
        market.sellShares(shares, outcomeIndex, 0, block.timestamp + 2);
    }

    function test_sellShares_reverts_on_closed_market() external {
        // Arrange
        uint256 shares = 100e6;
        uint256 outcomeIndex = 0;
        vm.warp(2 days);
        market.closeMarket();

        // Act & Assert
        hoax(bob, shares);
        vm.expectRevert(MarketClosed.selector);
        market.sellShares(shares, outcomeIndex, 0, block.timestamp + 1);
    }

    /*//////////////////////////////////////////////////////////////
                            removeLiquidity
    //////////////////////////////////////////////////////////////*/
    function test_removeLiquidity_when_market_is_balanced() external {
        // Arrange
        uint256 amount = 500e6;

        deal(address(USDC), bob, amount);
        vm.prank(bob);
        USDC.approve(address(market), amount);
        vm.prank(bob);
        market.addLiquidity(amount, block.timestamp + 1);

        IMarket.MarketPoolData memory prePoolData = market.getPoolData();
        (, uint256[] memory preTotalShares, uint256[] memory prePoolShares) = market.getOutcomes();

        // Act
        uint256 shares = market.getUserLiquidityShares(bob);
        vm.prank(bob);
        market.removeLiquidity(shares, block.timestamp + 1);

        // Assert
        IMarket.MarketPoolData memory poolData = market.getPoolData();
        (, uint256[] memory totalShares, uint256[] memory poolShares) = market.getOutcomes();

        uint256[] memory bobOutcomeShares = market.getUserOutcomeShares(bob);

        /// Assert Balance
        assertEq(poolData.balance, prePoolData.balance - shares);

        /// Assert Liquidity Value
        assertEq(poolData.liquidity, prePoolData.liquidity - shares);

        /// Assert Total Outcome Shares
        assertEq(poolData.totalAvailableShares, prePoolData.totalAvailableShares - (shares * 2));
        assertEq(totalShares[0], preTotalShares[0] - shares);
        assertEq(totalShares[1], preTotalShares[1] - shares);

        /// Assert Pool Shares
        assertEq(poolShares[0], prePoolShares[0] - shares);
        assertEq(poolShares[1], prePoolShares[1] - shares);

        /// Assert User Outcome Shares
        assertEq(bobOutcomeShares[0], 0);
        assertEq(bobOutcomeShares[1], 0);

        /// Assert User Liquidity Shares
        assertEq(market.getUserLiquidityShares(bob), 0);

        assertInvariant(market);
        assertTotalAvailableShares(market);
        assertMarketBalance(market);
    }

    function test_removeLiquidity_when_entered_balanced_exit_in_unbalanced() external {
        // Arrange
        uint256 amount = 500e6;

        deal(address(USDC), bob, amount);
        vm.prank(bob);
        USDC.approve(address(market), amount);
        vm.prank(bob);
        market.addLiquidity(amount, block.timestamp + 1);

        uint256 aliceBuyAmount = 100e6;
        deal(address(USDC), alice, aliceBuyAmount);
        vm.prank(alice);
        USDC.approve(address(market), aliceBuyAmount);
        vm.prank(alice);
        market.buyShares(aliceBuyAmount, 0, 0, block.timestamp + 1);

        IMarket.MarketPoolData memory prePoolData = market.getPoolData();
        (, uint256[] memory preTotalShares, uint256[] memory prePoolShares) = market.getOutcomes();

        // Act
        uint256 bobClaimableFees = market.getClaimableFees(bob);
        uint256 liquiditySharesValue = USDC.balanceOf(bob);
        uint256 shares = market.getUserLiquidityShares(bob);
        vm.prank(bob);
        market.removeLiquidity(shares, block.timestamp + 1);
        liquiditySharesValue = USDC.balanceOf(bob) - liquiditySharesValue - bobClaimableFees;

        // Assert
        IMarket.MarketPoolData memory poolData = market.getPoolData();
        (, uint256[] memory totalShares, uint256[] memory poolShares) = market.getOutcomes();

        uint256[] memory bobOutcomeShares = market.getUserOutcomeShares(bob);

        /// Assert Balance
        assertEq(poolData.balance, prePoolData.balance - liquiditySharesValue);

        /// Assert Liquidity Value
        assertApproxEqAbs(liquiditySharesValue, 469.33 * (10 ** 6), 0.01 * (10 ** 6));
        assertEq(poolData.liquidity, prePoolData.liquidity - shares);

        /// Assert Total Outcome Shares
        assertEq(
            poolData.totalAvailableShares
                >= prePoolData.totalAvailableShares - (liquiditySharesValue * 2) - bobOutcomeShares[1],
            true
        );
        assertEq(totalShares[0], preTotalShares[0] - liquiditySharesValue);
        assertEq(totalShares[1], preTotalShares[1] - liquiditySharesValue);

        /// Assert Pool Shares
        assertEq(poolShares[0], prePoolShares[0] - liquiditySharesValue);
        assertEq(poolShares[1], prePoolShares[1] - liquiditySharesValue - bobOutcomeShares[1]);

        /// Assert User Outcome Shares
        assertEq(bobOutcomeShares[0], 0);
        assertApproxEqAbs(bobOutcomeShares[1], 63.32 * (10 ** 6), 0.01 * (10 ** 6));

        /// Assert User Liquidity Shares
        assertEq(market.getUserLiquidityShares(bob), 0);

        assertInvariant(market);
        assertTotalAvailableShares(market);
        assertMarketBalance(market);
    }

    function test_removeLiquidity_when_entered_unbalanced_exit_in_unbalanced() external {
        // Arrange
        deal(address(USDC), alice, 100e6);
        vm.prank(alice);
        USDC.approve(address(market), 100e6);
        vm.prank(alice);
        market.buyShares(100e6, 0, 0, block.timestamp + 1);

        IMarket.MarketPoolData memory preAddLiquidityPoolData = market.getPoolData();
        (, uint256[] memory preAddLiquidityTotalShares, uint256[] memory preAddLiquidityShares) = market.getOutcomes();

        uint256 amount = 500e6;
        deal(address(USDC), bob, amount);
        vm.prank(bob);
        USDC.approve(address(market), amount);
        vm.prank(bob);
        market.addLiquidity(amount, block.timestamp + 1);

        // Act
        uint256 liquiditySharesValue = USDC.balanceOf(bob);
        uint256 shares = market.getUserLiquidityShares(bob);
        vm.prank(bob);
        market.removeLiquidity(shares, block.timestamp + 1);
        liquiditySharesValue = USDC.balanceOf(bob) - liquiditySharesValue;

        // Assert
        IMarket.MarketPoolData memory poolData = market.getPoolData();
        (, uint256[] memory totalShares, uint256[] memory poolShares) = market.getOutcomes();

        uint256[] memory bobOutcomeShares = market.getUserOutcomeShares(bob);

        /// Assert Balance
        assertApproxEqAbs(poolData.balance, preAddLiquidityPoolData.balance + amount - liquiditySharesValue, 1e6);

        /// Assert Liquidity Value
        assertApproxEqAbs(liquiditySharesValue, 414.72 * (10 ** 6), 0.01 * (10 ** 6));
        assertApproxEqAbs(poolData.liquidity, preAddLiquidityPoolData.liquidity, 1e6);

        /// Assert Total Outcome Shares
        assertApproxEqAbs(poolData.totalAvailableShares, preAddLiquidityPoolData.totalAvailableShares, 1e6);
        assertApproxEqAbs(totalShares[0], preAddLiquidityTotalShares[0] + bobOutcomeShares[0], 1e6);
        assertApproxEqAbs(totalShares[1], preAddLiquidityTotalShares[1] + bobOutcomeShares[1], 1e6);

        /// Assert Pool Shares
        assertApproxEqAbs(poolShares[0], preAddLiquidityShares[0], 1e6);
        assertApproxEqAbs(poolShares[1], preAddLiquidityShares[1], 1e6);

        /// Assert User Outcome Shares
        assertEq(bobOutcomeShares[0], bobOutcomeShares[1]);
        assertApproxEqAbs(bobOutcomeShares[1], 85.27 * (10 ** 6), 0.01 * (10 ** 6));

        /// Assert User Liquidity Shares
        assertEq(market.getUserLiquidityShares(bob), 0);

        assertInvariant(market);
        assertTotalAvailableShares(market);
        assertMarketBalance(market);
    }

    function test_removeLiquidity_reverts_on_deadline_passed() external {
        // Arrange
        uint256 amount = 500e6;

        deal(address(USDC), bob, amount);
        vm.prank(bob);
        USDC.approve(address(market), amount);
        vm.prank(bob);
        market.addLiquidity(amount, block.timestamp + 1);

        uint256 shares = market.getUserLiquidityShares(bob);

        // Act & Assert
        vm.expectRevert(DeadlinePassed.selector);
        market.removeLiquidity(shares, block.timestamp - 1);
    }

    function test_removeLiquidity_reverts_on_insufficient_shares() external {
        // Arrange
        uint256 amount = 500e6;

        deal(address(USDC), bob, amount);
        vm.prank(bob);
        USDC.approve(address(market), amount);
        vm.prank(bob);
        market.addLiquidity(amount, block.timestamp + 1);

        uint256 shares = market.getUserLiquidityShares(bob);

        // Act & Assert
        vm.expectRevert(InsufficientShares.selector);
        market.removeLiquidity(shares + 1, block.timestamp + 1);
    }

    function test_removeLiquidity_reverts_on_close_time_passed() external {
        // Arrange
        uint256 amount = 500e6;

        deal(address(USDC), bob, amount);
        vm.prank(bob);
        USDC.approve(address(market), amount);
        vm.prank(bob);
        market.addLiquidity(amount, block.timestamp + 1);

        uint256 shares = market.getUserLiquidityShares(bob);
        vm.warp(block.timestamp + 2 days);

        // Act & Assert
        vm.expectRevert(MarketClosed.selector);
        market.removeLiquidity(shares, block.timestamp + 2);
    }

    function test_removeLiquidity_reverts_on_closed_market() external {
        // Arrange
        uint256 amount = 500e6;

        deal(address(USDC), bob, amount);
        vm.prank(bob);
        USDC.approve(address(market), amount);
        vm.prank(bob);
        market.addLiquidity(amount, block.timestamp + 1);

        uint256 shares = market.getUserLiquidityShares(bob);
        vm.warp(block.timestamp + 2 days);
        market.closeMarket();

        // Act & Assert
        vm.expectRevert(MarketClosed.selector);
        market.removeLiquidity(shares, block.timestamp + 2);
    }

    /*//////////////////////////////////////////////////////////////
                            closeMarket
    //////////////////////////////////////////////////////////////*/
    function test_closeMarket_closes_market() external {
        // Arrange
        vm.warp(block.timestamp + 2 days);

        vm.expectEmit(true, false, false, true);
        emit IMarket.MarketStateUpdated(block.timestamp, IMarket.MarketState.closed);

        // Act
        market.closeMarket();

        // Assert
        assert(market.state() == IMarket.MarketState.closed);

        assertInvariant(market);
        assertTotalAvailableShares(market);
        assertMarketBalance(market);
    }

    function test_closeMarket_reverts_when_not_time() external {
        // Arrange
        vm.warp(block.timestamp + 1 minutes);

        // Act
        vm.expectRevert(MarketCloseTimeNotPassed.selector);
        market.closeMarket();

        // Assert
        assert(market.state() == IMarket.MarketState.open);
    }

    function test_closeMarket_reverts_when_market_already_closed() external {
        // Arrange
        vm.warp(block.timestamp + 2 days);
        market.closeMarket();

        // Act
        vm.expectRevert(InvalidMarketState.selector);
        market.closeMarket();

        // Assert
        assert(market.state() == IMarket.MarketState.closed);
    }

    /*//////////////////////////////////////////////////////////////
                            resolveMarket
    //////////////////////////////////////////////////////////////*/
    function test_resolveMarket_closed_market() external {
        // Arrange
        vm.warp(market.getInfo().closeTime + 2 days);
        market.closeMarket();
        skip(market.resolveDelay());
        vm.prank(creator);
        oracle.setOutcome(0);

        vm.expectEmit(true, false, false, true);
        emit IMarket.MarketStateUpdated(block.timestamp, IMarket.MarketState.resolved);

        // Act
        market.resolveMarket();

        // Assert
        assert(market.state() == IMarket.MarketState.resolved);

        assertInvariant(market);
        assertTotalAvailableShares(market);
        assertMarketBalance(market);
    }

    function test_resolveMarket_reverts_when_not_time() external {
        // Arrange
        vm.warp(block.timestamp + 1 minutes);

        // Act
        vm.expectRevert(InvalidMarketState.selector);
        market.resolveMarket();

        // Assert
        assert(market.state() == IMarket.MarketState.open);
    }

    function test_resolveMarket_reverts_when_delay_not_passed() external {
        // Arrange
        vm.warp(block.timestamp + 2 days);
        market.closeMarket();

        // Act
        vm.expectRevert(MarketResolveDelayNotPassed.selector);
        market.resolveMarket();

        // Assert
        assert(market.state() == IMarket.MarketState.closed);
    }

    function test_resolveMarket_reverts_when_oracle_not_resolved() external {
        // Arrange
        vm.warp(market.getInfo().closeTime + 2 days);
        market.closeMarket();
        skip(market.getResolveDelay());

        // Act
        vm.expectRevert(OracleNotResolved.selector);
        market.resolveMarket();

        // Assert
        assert(market.state() == IMarket.MarketState.closed);
    }

    /*//////////////////////////////////////////////////////////////
                            claimRewards
    //////////////////////////////////////////////////////////////*/
    function test_claimRewards_claims_eth_equal_to_shares() external {
        // Arrange
        uint256 amount = 500e5;
        deal(address(USDC), bob, amount);
        vm.prank(bob);
        USDC.approve(address(market), amount);
        vm.prank(bob);
        market.buyShares(amount, 0, 0, block.timestamp + 1);
        uint256[] memory bobOutcomeShares = market.getUserOutcomeShares(bob);

        resolveMarket(market);

        vm.expectEmit(true, false, false, true);
        emit IMarket.RewardsClaimed(bob, bobOutcomeShares[0], 0);

        // Act
        uint256 balance = USDC.balanceOf(bob);
        vm.prank(bob);
        market.claimRewards();
        uint256 claimed = USDC.balanceOf(bob) - balance;

        // Assert
        assertEq(claimed, bobOutcomeShares[0]);

        assertInvariant(market);
        assertTotalAvailableShares(market);

        uint256 creatorLiqiudityValue = marketAMM.getClaimLiquidityData(
            market.getUserLiquidityShares(creator),
            market.getPoolData().outcomes[0].shares.available,
            market.getPoolData().liquidity
        );
        assertEq(market.getPoolData().balance >= creatorLiqiudityValue, true);
        assertEq(USDC.balanceOf(address(market)) >= market.getPoolData().balance, true);
    }

    function test_claimRewards_reverts_when_no_shares() external {
        // Arrange
        resolveMarket(market);

        // Act & Assert
        vm.expectRevert(NoRewardsToClaim.selector);
        market.claimRewards();
    }

    /*//////////////////////////////////////////////////////////////
                            claimLiquidity
    //////////////////////////////////////////////////////////////*/
    function test_claimLiquidity_claims_eth_proportional_to_liquidity_and_resolved_outcome_shares() external {
        // Arrange
        uint256 amount = 500e6;
        deal(address(USDC), bob, amount);
        vm.prank(bob);
        USDC.approve(address(market), amount);
        vm.prank(bob);
        market.addLiquidity(amount, block.timestamp + 1);

        uint256 aliceBuyAmount = 100e6;
        deal(address(USDC), alice, aliceBuyAmount);
        vm.prank(alice);
        USDC.approve(address(market), aliceBuyAmount);
        vm.prank(alice);
        market.buyShares(aliceBuyAmount, 0, 0, block.timestamp + 1);

        resolveMarket(market);

        uint256 resolvedOutcomeIndex = market.getResolveOutcomeIndex();
        IMarket.MarketPoolData memory prePoolData = market.getPoolData();

        vm.prank(bob);
        market.claimFees();

        vm.expectEmit(true, false, false, false);
        emit IMarket.LiquidityClaimed(bob, 0); // Does not check the values

        // Act
        uint256 balance = USDC.balanceOf(bob);
        vm.prank(bob);
        market.claimLiquidity();
        uint256 claimed = USDC.balanceOf(bob) - balance;

        // Assert
        IMarket.MarketPoolData memory poolData = market.getPoolData();
        assertApproxEqAbs(claimed, 469.33 * (10 ** 6), 0.01 * (10 ** 6));
        assertEq(poolData.liquidity, prePoolData.liquidity);

        assertInvariant(market);
        assertTotalAvailableShares(market);

        uint256 creatorLiqiudityValue = marketAMM.getClaimLiquidityData(
            market.getUserLiquidityShares(creator),
            poolData.outcomes[resolvedOutcomeIndex].shares.available,
            poolData.liquidity
        );
        uint256[] memory aliceOutcomeShares = market.getUserOutcomeShares(alice);

        assertEq(poolData.balance >= creatorLiqiudityValue + aliceOutcomeShares[resolvedOutcomeIndex], true);
        assertEq(USDC.balanceOf(address(market)) >= poolData.balance, true);
    }

    function test_claimLiquidity_claim_all_liqudity() external {
        // Arrange
        uint256 amount = 500e6;
        deal(address(USDC), bob, amount);
        vm.prank(bob);
        USDC.approve(address(market), amount);
        vm.prank(bob);
        market.addLiquidity(amount, block.timestamp + 1);

        uint256 aliceBuyAmount = 100e6;
        deal(address(USDC), alice, aliceBuyAmount);
        vm.prank(alice);
        USDC.approve(address(market), aliceBuyAmount);
        vm.prank(alice);
        market.buyShares(aliceBuyAmount, 0, 0, block.timestamp + 1);

        resolveMarket(market);

        uint256 resolvedOutcomeIndex = market.getResolveOutcomeIndex();
        (,, uint256[] memory prePoolShares) = market.getOutcomes();

        vm.prank(bob);
        market.claimFees();

        vm.prank(creator);
        market.claimFees();

        // Act
        uint256 bobBalance = USDC.balanceOf(bob);
        vm.prank(bob);
        market.claimLiquidity();
        uint256 bobClaimed = USDC.balanceOf(bob) - bobBalance;

        uint256 creatorBalance = USDC.balanceOf(creator);
        vm.prank(creator);
        market.claimLiquidity();
        uint256 creatorClaimed = USDC.balanceOf(creator) - creatorBalance;

        // Assert
        IMarket.MarketPoolData memory poolData = market.getPoolData();
        (,, uint256[] memory poolShares) = market.getOutcomes();

        assertApproxEqAbs(bobClaimed, 469.33 * (10 ** 6), 0.01 * (10 ** 6));
        assertApproxEqAbs(creatorClaimed, 938.67 * (10 ** 6), 0.01 * (10 ** 6));
        assertEq(prePoolShares[resolvedOutcomeIndex] >= bobClaimed + creatorClaimed, true);
        assertEq(poolShares[resolvedOutcomeIndex] >= bobClaimed + creatorClaimed, true);

        uint256[] memory aliceOutcomeShares = market.getUserOutcomeShares(alice);
        uint256[] memory bobOutcomeShares = market.getUserOutcomeShares(bob);
        assertEq(poolData.balance >= bobOutcomeShares[resolvedOutcomeIndex] + aliceOutcomeShares[resolvedOutcomeIndex], true);
        assertEq(USDC.balanceOf(address(market)) >= poolData.balance, true);

        assertInvariant(market);
        assertTotalAvailableShares(market);
    }

    function test_claimLiquidity_reverts_when_no_liquidity() external {
        // Arrange
        resolveMarket(market);

        // Act & Assert
        vm.expectRevert(NoLiquidityToClaim.selector);
        market.claimLiquidity();
    }

    function test_claimLiquidity_reverts_when_market_not_resolved() external {
        // Arrange && Act & Assert
        vm.expectRevert(InvalidMarketState.selector);
        market.claimLiquidity();
    }

    /*//////////////////////////////////////////////////////////////
                            claimFees
    //////////////////////////////////////////////////////////////*/
    function test_claimFees_claims_eth_proportional_to_liquidity_shares() external {
        // Arrange
        uint256 amount = 500e6;
        deal(address(USDC), bob, amount);
        vm.prank(bob);
        USDC.approve(address(market), amount);
        vm.prank(bob);
        market.addLiquidity(amount, block.timestamp + 1);

        uint256 aliceBuyAmount = 100e6;
        deal(address(USDC), alice, aliceBuyAmount);
        vm.prank(alice);
        USDC.approve(address(market), aliceBuyAmount);
        vm.prank(alice);
        market.buyShares(aliceBuyAmount, 0, 0, block.timestamp + 1);

        vm.expectEmit(true, false, false, false);
        emit IMarket.FeesClaimed(bob, 0); // Does not check the values

        // Act
        uint256 balance = USDC.balanceOf(bob);
        vm.prank(bob);
        market.claimFees();
        uint256 claimed = USDC.balanceOf(bob) - balance;

        // Assert
        assertApproxEqAbs(claimed, 0.66 * (10 ** 6), 0.01 * (10 ** 6));
        assertApproxEqAbs(market.getUserClaimedFees(bob), 0.66 * (10 ** 6), 0.01 * (10 ** 6));

        assertInvariant(market);
        assertTotalAvailableShares(market);
    }

    function test_claimFees_cannot_claim_twice() external {
        // Arrange
        uint256 amount = 500e6;
        deal(address(USDC), bob, amount);
        vm.prank(bob);
        USDC.approve(address(market), amount);
        vm.prank(bob);
        market.addLiquidity(amount, block.timestamp + 1);

        uint256 aliceBuyAmount = 100e6;
        deal(address(USDC), alice, aliceBuyAmount);
        vm.prank(alice);
        USDC.approve(address(market), aliceBuyAmount);
        vm.prank(alice);
        market.buyShares(aliceBuyAmount, 0, 0, block.timestamp + 1);

        vm.prank(bob);
        market.claimFees();

        // Act
        uint256 balance = USDC.balanceOf(bob);
        vm.prank(bob);
        market.claimFees();
        uint256 claimed = USDC.balanceOf(bob) - balance;

        // Assert
        assertEq(claimed, 0);
    }

    /*//////////////////////////////////////////////////////////////
                            getOutcomes
    //////////////////////////////////////////////////////////////*/
    function test_getOutcomes_returns_correct_outcomes() external view {
        // Act
        (string[] memory names, uint256[] memory totalShares, uint256[] memory poolShares) = market.getOutcomes();

        // Assert
        assertEq(names.length, 2);
        assertEq(names[0], "Yes");
        assertEq(names[1], "No");

        assertEq(totalShares.length, 2);
        assertEq(totalShares[0], 1000e6);
        assertEq(totalShares[1], 1000e6);

        assertEq(poolShares.length, 2);
        assertEq(poolShares[0], 1000e6);
        assertEq(poolShares[1], 1000e6);
    }

    /*//////////////////////////////////////////////////////////////
                            getResolveOutcomeIndex
    //////////////////////////////////////////////////////////////*/
    function test_getResolveOutcomeIndex_returns_correct_outcome_index() external {
        // Arrange
        resolveMarket(market);

        // Act
        uint256 outcomeIndex = market.getResolveOutcomeIndex();

        // Assert
        assertEq(outcomeIndex, 0);
    }

    function test_getResolveOutcomeIndex_when_market_not_resolved() external {
        // Arrange
        vm.warp(block.timestamp + 2 days);
        market.closeMarket();

        // Act
        vm.expectRevert(InvalidMarketState.selector);
        market.getResolveOutcomeIndex();
    }

    /*//////////////////////////////////////////////////////////////
                            getOutcomePrice
    //////////////////////////////////////////////////////////////*/
    function test_getOutcomePrice_returns_correct_price() external {
        // Arrange
        deal(address(USDC), alice, 100e6);
        vm.prank(alice);
        USDC.approve(address(market), 100e6);
        vm.prank(alice);
        market.buyShares(100e6, 0, 0, block.timestamp + 1);

        uint256 amount = 500e6;
        deal(address(USDC), bob, amount);
        vm.prank(bob);
        USDC.approve(address(market), amount);
        vm.prank(bob);
        market.addLiquidity(amount, block.timestamp + 1);

        // Act
        uint256 priceA = market.getOutcomePrice(0);
        uint256 priceB = market.getOutcomePrice(1);

        // Assert
        assertEq(priceA, 546609);
        assertEq(priceB, 453390);
        assertApproxEqAbs(priceA + priceB, 1e6, 1e1);
    }

    function test_getOutcomePrice_when_resolved_Market() external {
        // Arrange
        resolveMarket(market);
        uint256 resolvedIndex = market.getResolveOutcomeIndex();

        // Act
        uint256 resolvedPrice = market.getOutcomePrice(resolvedIndex);
        uint256 losingPrice = market.getOutcomePrice(resolvedIndex == 0 ? 1 : 0);

        // Assert
        assertEq(resolvedPrice, 1 * 1e6);
        assertEq(losingPrice, 0);
    }
}
