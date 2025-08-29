"use client";

import { FC, useState } from "react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { parseUnits } from "viem";

import { useUSDBalanceContext } from "@/app/contexts/BalanceContext";
import { useTransactionContext } from "@/app/contexts/TransactionContext";

import { Market, MarketStateExtended } from "@/lib/types";
import { formatAmountWithRegex } from "@/lib/utils";
import { getMarketStateData } from "@/lib/contracts";

import { useUserShares } from "@/app/hooks/useUserShares";

import { toast } from "@/app/components/ui/toast";
import { NumberInput } from "@/app/components/ui/number-input";
import { useClaimFees } from "@/app/hooks/useClaimFees";
import { useAddLiquidity } from "@/app/hooks/useAddLiquidity";
import { useRemoveLiquidity } from "@/app/hooks/useRemoveLiquidity";
import { useClaimLiquidity } from "@/app/hooks/useClaimLiquidity";

type Props = {
  market: Market;
};

export const MarketDetailsLiquiditySiderbar: FC<Props> = ({ market }) => {
  const { address: account } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { isTransactionInProgress } = useTransactionContext();

  const { usdBalance } = useUSDBalanceContext();
  const {
    startWriteFlow: startAddLiquidityFlow,
    isConfirming: isConfirmingBuy,
    isPending: isPendingBuy,
  } = useAddLiquidity();

  const {
    startWriteFlow: startRemoveLiquidityWriteFlow,
    isConfirming: isConfirmingSell,
    isPending: isPendingSell,
  } = useRemoveLiquidity();

  const {
    startWriteFlow: startClaimFeesFlow,
    isConfirming: isConfirmingClaimFees,
    isPending: isPendingClaimFees,
  } = useClaimFees();

  const {
    startWriteFlow: startClaimLiquidityFlow,
    isConfirming: isConfirmingClaimLiquidity,
    isPending: isPendingClaimLiquidity,
  } = useClaimLiquidity();

  const sharesData = useUserShares(market);

  const [tradeType, setTradeType] = useState<"Add" | "Remove">("Add");
  const [liquidityAmount, setLiquidityAmount] = useState("0");

  const marketExtendedState = getMarketStateData(market);

  const handleActionButton = async () => {
    if (disabled) {
      return;
    }

    if (marketExtendedState === MarketStateExtended.Open) {
      await handleLiquidityAction();
    }

    if (marketExtendedState === MarketStateExtended.Resolved) {
      await startClaimLiquidityFlow({
        address: market.address.toLocaleLowerCase() as `0x${string}`,
      });
    }
  };

  const handleClaimFees = async () => {
    if (sharesData.claimableFees === BigInt("0")) {
      return;
    }

    await startClaimFeesFlow({ address: market.address.toLocaleLowerCase() as `0x${string}` });
  };

  const handleLiquidityAction = async () => {
    if (!account) {
      openConnectModal?.();
      return;
    }

    if (!liquidityAmount || parseFloat(liquidityAmount) <= 0) {
      toast({ title: "Please enter a valid amount!", error: true, dismissable: true });
      return;
    }

    if (tradeType === "Add") {
      await startAddLiquidityFlow(
        {
          address: market.address.toLocaleLowerCase() as `0x${string}`,
          amount: liquidityAmount,
        },
        () => setLiquidityAmount("0"),
      );
    } else {
      await startRemoveLiquidityWriteFlow(
        {
          address: market.address.toLocaleLowerCase() as `0x${string}`,
          shares: liquidityAmount,
        },
        () => setLiquidityAmount("0"),
      );
    }
  };

  const insufficientBalance =
    (tradeType === "Add"
      ? parseUnits(liquidityAmount, 6) > usdBalance
      : parseUnits(liquidityAmount, 6) > sharesData.liqudityShares) && account;

  const invalidTradeInput =
    marketExtendedState === MarketStateExtended.Open &&
    ((account && (!liquidityAmount || parseFloat(liquidityAmount) <= 0)) ||
      !!insufficientBalance ||
      isConfirmingBuy ||
      isConfirmingSell ||
      isPendingBuy ||
      isPendingSell ||
      isConfirmingClaimFees ||
      isPendingClaimFees ||
      isConfirmingClaimLiquidity ||
      isPendingClaimLiquidity);

  const disabled: boolean =
    invalidTradeInput ||
    marketExtendedState === MarketStateExtended.Closable ||
    marketExtendedState === MarketStateExtended.Closed ||
    marketExtendedState === MarketStateExtended.Resolvable ||
    (marketExtendedState === MarketStateExtended.Resolved &&
      sharesData.liqudityShares === BigInt("0")) ||
    isTransactionInProgress;

  const marketNotResolved = typeof market.resolvedOutcomeIndex !== "number";

  return (
    <div className="flex flex-col bg-dark-800/60 border border-dark-700/50 rounded-xl p-3 max-h-[27rem]">
      {/* Top Section - Buy/Sell Tabs and Market Dropdown */}
      <div className="flex justify-between items-center mb-4">
        {/* Buy/Sell Tabs */}
        <div className="flex space-x-1">
          <button
            disabled={isTransactionInProgress}
            onClick={() => {
              if (marketNotResolved) {
                setTradeType("Add");
                setLiquidityAmount("0");
              }
            }}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              marketNotResolved && tradeType === "Add"
                ? "text-white"
                : "text-gray-400 hover:text-gray-300"
            } ${isTransactionInProgress ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Add
            {marketNotResolved && tradeType === "Add" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sei-400"></div>
            )}
          </button>
          <button
            disabled={isTransactionInProgress}
            onClick={() => {
              if (marketNotResolved) {
                setTradeType("Remove");
                setLiquidityAmount("0");
              }
            }}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              marketNotResolved && tradeType === "Remove"
                ? "text-white"
                : "text-gray-400 hover:text-gray-300"
            } ${isTransactionInProgress ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Remove
            {marketNotResolved && tradeType === "Remove" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sei-400"></div>
            )}
          </button>
        </div>

        {/* Market Button */}
        <div className="relative">
          <button
            disabled={isTransactionInProgress}
            className={`flex items-center space-x-2 px-4 py-2 bg-dark-700/50 border border-dark-600/50 rounded-lg text-white ${
              isTransactionInProgress ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <span className="text-sm font-medium">Liquidity</span>
          </button>
        </div>
      </div>

      {/* Amount Section */}
      <div>
        <div className="flex justify-between items-center gap-2 mb-3 overflow-hidden h-5">
          <span className="text-white font-medium">
            {tradeType === "Remove" ? "Shares" : "Amount"}
          </span>
          <span className="text-gray-400 text-lg font-semibold overflow-hidden">
            {tradeType === "Remove" ? "" : "$"}
            {liquidityAmount}
          </span>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "25%", delimiter: BigInt(4) },
            { label: "50%", delimiter: BigInt(2) },
            { label: "Max", delimiter: BigInt(1) },
          ].map((item) => (
            <button
              disabled={marketExtendedState != MarketStateExtended.Open || isTransactionInProgress}
              key={item.label}
              onClick={() => {
                if (tradeType === "Add") {
                  setLiquidityAmount(formatAmountWithRegex(usdBalance / item.delimiter, 6, 2));
                } else {
                  setLiquidityAmount(
                    formatAmountWithRegex(sharesData.liqudityShares / item.delimiter, 6, 2),
                  );
                }
              }}
              className={`py-2 px-3 bg-dark-700/50 text-gray-300 rounded-lg text-sm hover:bg-dark-600/50 transition-colors ${
                isTransactionInProgress ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Amount Input */}
        <div>
          {(tradeType == "Remove" || !marketNotResolved) && (
            <label className="font-bold text-sm">
              Liquidity Shares: {formatAmountWithRegex(sharesData.liqudityShares, 6, 2, true)}
            </label>
          )}
          <NumberInput
            disabled={marketExtendedState != MarketStateExtended.Open || isTransactionInProgress}
            decimals={2}
            value={liquidityAmount}
            onChange={(e) => setLiquidityAmount(e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grow flex flex-col justify-end">
        <div className="mb-2 h-5">
          {insufficientBalance && <p className="text-red-500 text-sm">Insufficient Balance</p>}
        </div>
        <button
          disabled={disabled}
          onClick={handleActionButton}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
            disabled
              ? "bg-dark-700/50 text-gray-400 cursor-not-allowed"
              : "bg-sei-400 text-dark-950 hover:bg-sei-300"
          }`}
        >
          {marketExtendedState !== MarketStateExtended.Open ? "Claim Liquidity" : tradeType}
        </button>
      </div>

      <div className="mt-6">
        <label className="font-bold text-sm">
          Claimable Fees: {formatAmountWithRegex(sharesData.claimableFees, 6, 2, true)}
        </label>
        <div className="grow flex flex-col justify-end">
          <button
            disabled={sharesData.claimableFees === BigInt("0") || isTransactionInProgress}
            onClick={handleClaimFees}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
              sharesData.claimableFees === BigInt("0") || isTransactionInProgress
                ? "bg-dark-700/50 text-gray-400 cursor-not-allowed"
                : "bg-sei-400 text-dark-950 hover:bg-sei-300"
            }`}
          >
            Claim Fees
          </button>
        </div>
      </div>
    </div>
  );
};
