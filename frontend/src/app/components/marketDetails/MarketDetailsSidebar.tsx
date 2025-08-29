"use client";

import { FC, useState } from "react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { parseUnits } from "viem";
import { useSearchParams } from "next/navigation";

import { useUSDBalanceContext } from "@/app/contexts/BalanceContext";
import { useTransactionContext } from "@/app/contexts/TransactionContext";

import { Market, MarketStateExtended } from "@/lib/types";
import { formatAmountWithRegex } from "@/lib/utils";
import { getMarketStateData } from "@/lib/contracts";

import { useBuyShares, useSellShares } from "@/app/hooks";
import { useTriggerResolution } from "@/app/hooks/useTriggerResolution";
import { useUserShares } from "@/app/hooks/useUserShares";

import { toast } from "@/app/components/ui/toast";
import { NumberInput } from "@/app/components/ui/number-input";
import { useClaimRewards } from "@/app/hooks/useClaimRewards";

type Props = {
  market: Market;
};

export const MarketDetailsSiderbar: FC<Props> = ({ market }) => {
  const { address: account } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { isTransactionInProgress } = useTransactionContext();
  const searchParams = useSearchParams();

  const { usdBalance } = useUSDBalanceContext();
  const {
    startWriteFlow: startBuySharesWriteFlow,
    isConfirming: isConfirmingBuy,
    isPending: isPendingBuy,
  } = useBuyShares();
  const {
    startWriteFlow: startSellSharesWriteFlow,
    isConfirming: isConfirmingSell,
    isPending: isPendingSell,
  } = useSellShares();
  const {
    startWriteFlow: startClaimRewardsFlow,
    isConfirming: isConfirmingClaim,
    isPending: isPendingClaim,
  } = useClaimRewards();

  const sharesData = useUserShares(market);
  const { mutation } = useTriggerResolution(market);

  const [tradeType, setTradeType] = useState<"Buy" | "Sell">("Buy");
  const [betAmount, setBetAmount] = useState("0");
  const [selectedOutcome, setSelectedOutcome] = useState<number>(
    typeof market.resolvedOutcomeIndex === "number"
      ? market.resolvedOutcomeIndex
      : Number(searchParams.get("outcome")) || 0,
  );

  const marketExtendedState = getMarketStateData(market);

  const formatPrice = (price: number) => {
    return (price * 100).toFixed(1) + "¢";
  };

  const handleActionButton = async () => {
    if (disabled) {
      return;
    }

    if (marketExtendedState === MarketStateExtended.Open) {
      await handleBet();
    }

    if (
      marketExtendedState === MarketStateExtended.Closable ||
      marketExtendedState === MarketStateExtended.Resolvable
    ) {
      mutation.mutate();
    }

    if (marketExtendedState === MarketStateExtended.Resolved) {
      await startClaimRewardsFlow({ address: market.address.toLocaleLowerCase() as `0x${string}` });
    }
  };

  const handleBet = async () => {
    if (!account) {
      openConnectModal?.();
      return;
    }

    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast({ title: "Please enter a valid amount!", error: true, dismissable: true });
      return;
    }

    if (tradeType === "Buy") {
      await startBuySharesWriteFlow(
        {
          address: market.address.toLocaleLowerCase() as `0x${string}`,
          outcomeIndex: selectedOutcome,
          amount: betAmount,
        },
        () => setBetAmount("0"),
      );
    } else {
      await startSellSharesWriteFlow(
        {
          address: market.address.toLocaleLowerCase() as `0x${string}`,
          outcomeIndex: selectedOutcome,
          shares: betAmount,
        },
        () => setBetAmount("0"),
      );
    }
  };

  const handlePercentageClick = (delimiter: bigint) => {
    if (tradeType === "Buy") {
      setBetAmount(formatAmountWithRegex(usdBalance / delimiter, 6, 2));
    } else {
      setBetAmount(
        formatAmountWithRegex(sharesData.outcomeShares[selectedOutcome] / delimiter, 6, 2),
      );
    }
  };

  const insufficientBalance =
    (tradeType === "Buy"
      ? parseUnits(betAmount, 6) > usdBalance
      : parseUnits(betAmount, 6) > sharesData.outcomeShares[selectedOutcome]) && account;

  const invalidTradeInput =
    marketExtendedState === MarketStateExtended.Open &&
    ((account && (!betAmount || parseFloat(betAmount) <= 0)) ||
      !!insufficientBalance ||
      isConfirmingBuy ||
      isConfirmingSell ||
      isPendingBuy ||
      isPendingSell ||
      isConfirmingClaim ||
      isPendingClaim);
  const disabled =
    invalidTradeInput ||
    mutation.isPending ||
    marketExtendedState === MarketStateExtended.Closed ||
    (marketExtendedState === MarketStateExtended.Resolved && !sharesData.hasWinningOutcome) ||
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
                setTradeType("Buy");
                setBetAmount("0");
              }
            }}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              marketNotResolved && tradeType === "Buy"
                ? "text-white"
                : "text-gray-400 hover:text-gray-300"
            } ${isTransactionInProgress ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Buy
            {marketNotResolved && tradeType === "Buy" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sei-400"></div>
            )}
          </button>
          <button
            disabled={isTransactionInProgress}
            onClick={() => {
              if (marketNotResolved) {
                setTradeType("Sell");
                setBetAmount("0");
              }
            }}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              marketNotResolved && tradeType === "Sell"
                ? "text-white"
                : "text-gray-400 hover:text-gray-300"
            } ${isTransactionInProgress ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Sell
            {marketNotResolved && tradeType === "Sell" && (
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
            <span className="text-sm font-medium">Market</span>
          </button>
        </div>
      </div>

      {/* Outcome Selection Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {market.outcomes?.slice(0, 2).map((outcome, index) => (
          <button
            key={index}
            disabled={isTransactionInProgress}
            onClick={() => {
              if (typeof market.resolvedOutcomeIndex === "number") {
                setSelectedOutcome(market.resolvedOutcomeIndex);
              } else {
                setSelectedOutcome(index);
              }
            }}
            className={`py-2.5 px-4 rounded-lg text-center transition-colors w-full ${
              market.resolvedOutcomeIndex === index ||
              (selectedOutcome === index && marketNotResolved)
                ? "bg-sei-400 text-dark-950"
                : "bg-dark-700/50 text-gray-300 hover:bg-dark-600/50"
            } ${isTransactionInProgress ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="text-base font-semibold overflow-hidden">
              <span className="truncate">{outcome}</span>
            </div>
            <div className="text-xs opacity-75">{formatPrice(market.outcomePrice[index])}</div>
          </button>
        ))}
      </div>

      {/* Amount Section */}
      <div>
        <div className="flex justify-between items-center gap-2 mb-3 overflow-hidden h-5">
          <span className="text-white font-medium">
            {tradeType === "Sell" ? "Shares" : "Amount"}
          </span>
          <span className="text-gray-400 text-lg font-semibold overflow-hidden">
            {tradeType === "Sell" ? "" : "$"}
            {betAmount}
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
              onClick={() => handlePercentageClick(item.delimiter)}
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
          {(tradeType == "Sell" || !marketNotResolved) && (
            <label className="font-bold text-sm">
              Shares: {formatAmountWithRegex(sharesData.outcomeShares[selectedOutcome], 6, 2, true)}
            </label>
          )}
          <NumberInput
            disabled={marketExtendedState != MarketStateExtended.Open || isTransactionInProgress}
            decimals={2}
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
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
          {marketExtendedState === MarketStateExtended.Resolved && "Cash out"}
          {(marketExtendedState === MarketStateExtended.Resolvable ||
            marketExtendedState === MarketStateExtended.Closed) &&
            "Resolve"}
          {marketExtendedState === MarketStateExtended.Closable && "Close"}
          {marketExtendedState === MarketStateExtended.Open &&
            (!account ? "Connect Wallet" : "Trade")}
        </button>
      </div>
    </div>
  );
};
