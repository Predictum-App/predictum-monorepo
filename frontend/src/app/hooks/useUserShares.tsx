import { useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { zeroAddress } from "viem";
import { useQueryClient } from "@tanstack/react-query";

import { MarketABI } from "@/abis";
import { Market } from "@/lib/types";
import { useTransactionContext } from "../contexts/TransactionContext";

export const useUserShares = (market: Market) => {
  const account = useAccount();
  const { isTransactionInProgress } = useTransactionContext();
  const queryClient = useQueryClient();

  const { data: outcomeShares, refetch: refetchOutcomeShares } = useReadContract({
    address: market.address as `0x${string}`,
    abi: MarketABI,
    functionName: "getUserOutcomeShares",
    args: [account.address || zeroAddress],
  });

  const { data: liqudityShares, refetch: refetchLiqudityShares } = useReadContract({
    address: market.address as `0x${string}`,
    abi: MarketABI,
    functionName: "getUserLiquidityShares",
    args: [account.address || zeroAddress],
  });

  const { data: claimableFees, refetch: refetchClaimableFees } = useReadContract({
    address: market.address as `0x${string}`,
    abi: MarketABI,
    functionName: "getClaimableFees",
    args: [account.address || zeroAddress],
  });

  useEffect(() => {
    if (!isTransactionInProgress) {
      refetchClaimableFees();
      refetchLiqudityShares();
      refetchOutcomeShares();
      queryClient.invalidateQueries({ queryKey: ["top-holders", market.address] });
      queryClient.invalidateQueries({ queryKey: ["chart-data", market.address] });
    }
  }, [
    market.address,
    queryClient,
    isTransactionInProgress,
    account.address,
    refetchClaimableFees,
    refetchLiqudityShares,
    refetchOutcomeShares,
  ]);

  const hasShares =
    (outcomeShares && outcomeShares.length > 0 && outcomeShares[0] > BigInt("0")) ||
    (outcomeShares && outcomeShares.length > 1 && outcomeShares[1] > BigInt("0"));

  const hasWinningOutcome =
    market.resolvedOutcomeIndex !== undefined &&
    outcomeShares &&
    outcomeShares.length > market.resolvedOutcomeIndex &&
    outcomeShares[market.resolvedOutcomeIndex] > BigInt("0");

  return {
    outcomeShares: outcomeShares || [BigInt("0"), BigInt("0")],
    hasShares,
    hasWinningOutcome,
    liqudityShares: liqudityShares || BigInt("0"),
    claimableFees: claimableFees || BigInt("0"),
  };
};
