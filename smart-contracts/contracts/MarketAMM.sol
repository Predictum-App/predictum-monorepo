// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "./errors/MarketErrors.sol";

import {IMarketAMM} from "./interfaces/IMarketAMM.sol";

/**
 * @title MarketAMM
 * @notice The MarketAMM is a contract, used for calculations by the Market contract for each action
 * @notice The current version:
 *         - supports binary outcomes only
 */
contract MarketAMM is IMarketAMM {
    using Math for uint256;

    /*//////////////////////////////////////////////////////////////
                             EXTERNAL PURE
    //////////////////////////////////////////////////////////////*/
    /**
     * @notice Calculates the amount of liquidity shares and outcome shares to return when adding liquidity to the market
     * @param _amount The amount of ETH to add to the market
     * @param _marketParams The required Market pool data to calculate the liquidity shares and outcome shares to return
     * @return liquidityShares The amount of liquidity shares to mint
     * @return outcomeShareToReturn The amount of outcome shares to give back to the user
     * @return newOutcomeShares The new outcome shares in the market pool
     */
    function getAddLiquidityData(uint256 _amount, MarketPoolState calldata _marketParams)
        external
        pure
        returns (uint256 liquidityShares, uint256[] memory outcomeShareToReturn, uint256[] memory newOutcomeShares)
    {
        uint256 outcomeCount = _marketParams.outcomeShares.length;
        uint256[] memory outcomeShares = _marketParams.outcomeShares;

        outcomeShareToReturn = new uint256[](outcomeCount);
        newOutcomeShares = new uint256[](outcomeCount);

        for (uint256 i = 0; i < outcomeCount; ++i) {
            newOutcomeShares[i] = outcomeShares[i] + _amount;
        }

        if (_marketParams.liquidity == 0) {
            return (_amount, outcomeShareToReturn, newOutcomeShares);
        } else {
            (uint256 likelyIndex, uint256 unlikelyIndex) = outcomeShares[0] > outcomeShares[1] ? (1, 0) : (0, 1);

            newOutcomeShares[likelyIndex] =
                newOutcomeShares[unlikelyIndex].mulDiv(outcomeShares[likelyIndex], outcomeShares[unlikelyIndex]);

            liquidityShares = _amount.mulDiv(_marketParams.liquidity, outcomeShares[unlikelyIndex]);

            outcomeShareToReturn[likelyIndex] = outcomeShares[likelyIndex] + _amount - newOutcomeShares[likelyIndex];
        }
    }

    /**
     * @notice Calculates the amount of ETH to return when selling removing liquidity from the market
     * @param _shares The amount of liquidity shares to remove
     * @param _marketParams The required Market pool data to calculate the ETH to return
     * @return liquidityValue The value of the liquidity shares to in ETH
     * @return outcomeSharesToReturn The amount of outcome shares to give back to the user
     * @return newOutcomeShares The new outcome shares in the market pool
     */
    function getRemoveLiquidityData(uint256 _shares, MarketPoolState calldata _marketParams)
        external
        pure
        returns (uint256 liquidityValue, uint256[] memory outcomeSharesToReturn, uint256[] memory newOutcomeShares)
    {
        uint256 outcomeCount = _marketParams.outcomeShares.length;
        uint256[] memory outcomeShares = _marketParams.outcomeShares;

        outcomeSharesToReturn = new uint256[](outcomeCount);
        newOutcomeShares = new uint256[](outcomeCount);

        (uint256 likelyIndex, uint256 unlikelyIndex) = outcomeShares[0] > outcomeShares[1] ? (1, 0) : (0, 1);
        uint256 unlikelyShares = outcomeShares[unlikelyIndex];

        liquidityValue = _shares.mulDiv(_marketParams.liquidity, unlikelyShares);

        for (uint256 i = 0; i < outcomeCount; ++i) {
            newOutcomeShares[i] = outcomeShares[i] - liquidityValue;
        }

        newOutcomeShares[unlikelyIndex] =
            newOutcomeShares[likelyIndex].mulDiv(unlikelyShares, outcomeShares[likelyIndex]);

        outcomeSharesToReturn[unlikelyIndex] = unlikelyShares - newOutcomeShares[unlikelyIndex] - liquidityValue;
    }

    /**
     * @notice Calculates the amount of outcome shares to return when buying an outcome with ETH
     * @param _amount the amount of ETH to buy shares with
     * @param _outcomeIndex the index of the outcome to buy shares from
     * @param _marketParams the required Market pool data to calculate the outcome shares to return
     * @return shares The amount of outcome shares to give back to the user
     */
    function getBuyOutcomeData(uint256 _amount, uint256 _outcomeIndex, MarketPoolState calldata _marketParams)
        external
        pure
        returns (uint256 shares)
    {
        uint256 oppositeOutcomeIndex = _outcomeIndex == 0 ? 1 : 0;
        uint256[] memory outcomeShares = _marketParams.outcomeShares;

        uint256 oppositeShares = outcomeShares[oppositeOutcomeIndex] + _amount;

        uint256 newBuyShares = getInvariant(_marketParams.liquidity, outcomeShares.length).ceilDiv(oppositeShares);

        shares = outcomeShares[_outcomeIndex] + _amount - newBuyShares;
    }

    /**
     * @notice Calculates the amount of ETH to return when selling outcome shares
     * @param _shares the amount of outcome shares to sell
     * @param _outcomeIndex the index of the outcome to sell shares from
     * @param _marketParams the required Market pool data to calculate the ETH to return
     * @return amount The amount of ETH to return to the user
     */
    function getSellOutcomeData(uint256 _shares, uint256 _outcomeIndex, MarketPoolState calldata _marketParams)
        external
        pure
        returns (uint256 amount)
    {
        uint256 oppositeOutcomeIndex = _outcomeIndex == 0 ? 1 : 0;
        uint256[] memory outcomeShares = _marketParams.outcomeShares;

        // We'll use binary search to find the correct amount
        uint256 invariant = getInvariant(_marketParams.liquidity, outcomeShares.length);
        uint256 oppositeShares = outcomeShares[oppositeOutcomeIndex];
        uint256 currentShares = outcomeShares[_outcomeIndex];
        
        // Check if the requested shares can be sold
        // The maximum shares that can be sold is limited by the pool's liquidity
        uint256 maxSellableShares = currentShares + oppositeShares - invariant.ceilDiv(oppositeShares);
        if (_shares > maxSellableShares) {
            revert InsufficientLiquidity();
        }
        
        // The amount must be less than oppositeShares to maintain positive shares
        uint256 low = 0;
        uint256 high = oppositeShares - 1;
        
        while (low <= high) {
            uint256 mid = (low + high) / 2;
            
            // Calculate what shares we would get if we tried to sell for this amount
            uint256 oppositeSharesAfter = oppositeShares - mid;
            if (oppositeSharesAfter == 0) {
                high = mid - 1;
                continue;
            }
            
            uint256 newSellShares = invariant.ceilDiv(oppositeSharesAfter);
            uint256 calculatedShares = newSellShares + mid - currentShares;
            
            if (calculatedShares >= _shares) {
                amount = mid;
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        
        // Validate that the calculated amount is reasonable
        if (amount >= oppositeShares) {
            revert InsufficientLiquidity();
        }
    }

    /**
     * @notice Calculates the liquidity value in ETH after the market is resolved
     * @param _liquidityShares the amount of liquidity shares to claim
     * @param _resolvedOutcomeShares the amount of outcome shares after the market is resolved
     * @param _liquidity the amount of liquidity in the market
     * @return amount The amount of ETH to return to the user
     */
    function getClaimLiquidityData(uint256 _liquidityShares, uint256 _resolvedOutcomeShares, uint256 _liquidity)
        external
        pure
        returns (uint256 amount)
    {
        amount = _liquidityShares.mulDiv(_resolvedOutcomeShares, _liquidity);
    }

    /**
     * @notice Returns the price of an outcome
     * @param _outcomeIndex the index of the outcome to get the price of
     * @param _totalAvailableShares the total tradeable outcome shares in the market pool
     * @param _marketParams the required Market pool data to calculate the outcome price
     * @return price of the outcome scaled by 1e6
     */
    function getOutcomePrice(
        uint256 _outcomeIndex,
        uint256 _totalAvailableShares,
        MarketPoolState calldata _marketParams
    ) external pure returns (uint256 price) {
        uint256 oppositeOutcomeIndex = _outcomeIndex == 0 ? 1 : 0;
        return _marketParams.outcomeShares[oppositeOutcomeIndex].mulDiv(1e6, _totalAvailableShares);
    }

    /*//////////////////////////////////////////////////////////////
                             PRIVATE PURE
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Calculates the invariant of the pool
     * @param liquidity the liquidity value of the pool
     * @param outcomeCount the total number of outcomes in the pool
     */
    function getInvariant(uint256 liquidity, uint256 outcomeCount) private pure returns (uint256) {
        return liquidity ** outcomeCount;
    }

    /**
     * @notice Calculates the square root of a number using Newton's method
     * @param x the number to calculate the square root of
     * @return the square root of x
     */
    function sqrt(uint256 x) private pure returns (uint256) {
        if (x == 0) return 0;
        if (x == 1) return 1;
        
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        
        return y;
    }
}
