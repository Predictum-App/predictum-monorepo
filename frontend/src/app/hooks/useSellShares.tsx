import { useCallback, useEffect, useState, useRef } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { simulateContract } from "wagmi/actions";
import { parseUnits } from "viem";
import { toast as soonerToast } from "sonner";
import { getUnixTime } from "date-fns";

import { MarketABI } from "@/abis";

import { SellSharesData } from "@/lib/types";
import { marketFactory } from "@/lib/contracts";
import { config } from "@/lib/wagmi";
import { decodeEvmTransactionErrorResult } from "@/lib/web3";

import { toast } from "@/app/components/ui/toast";
import { useRouter } from "next/navigation";
import { useTransactionContext } from "@/app/contexts/TransactionContext";

export const useSellShares = () => {
  const router = useRouter();
  const { startTransaction, endTransaction } = useTransactionContext();

  const account = useAccount();

  const [flowState, setFlowState] = useState<"waitingSell" | "sold" | null>(null);
  const toastIdRef = useRef<string | number | null>(null);
  const onSuccessRef = useRef<(() => void) | null>(null);

  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash: hash });

  useEffect(() => {
    if (error) {
      endTransaction();
    }
  }, [error, endTransaction]);

  const startWriteFlow = useCallback(
    async (data: SellSharesData, onSuccess?: () => void) => {
      onSuccessRef.current = onSuccess || null;

      try {
        if (!account.isConnected) {
          throw new Error("Please connect your wallet");
        }
        startTransaction();

        const amount = parseUnits(data.shares, 6);
        const minShares = BigInt(0);
        const deadline = BigInt((getUnixTime(new Date()) + 5 * 60).toString());

        try {
          const actionCall = {
            address: data.address,
            abi: MarketABI,
            functionName: "sellShares",
            args: [amount, BigInt(data.outcomeIndex.toString()), minShares, deadline],
          } as const;
          await simulateContract(config, actionCall);
          writeContract(actionCall);
        } catch (error) {
          console.log(error);

          const { decodedError, arg } = decodeEvmTransactionErrorResult({
            error,
            abi: marketFactory.abi,
          });

          if (typeof arg === "string") {
            throw new Error(arg);
          }

          if (decodedError && decodedError.errorName) {
            throw new Error(decodedError.errorName);
          }

          throw new Error("Failed to sell shares");
        }
      } catch (error) {
        endTransaction();

        if (error instanceof Error) {
          console.log(error.message);
          soonerToast.dismiss(toastIdRef.current || "");
          toast({ title: error.message, error: true, dismissable: true }, { duration: 10 * 1_000 });
        }
        return;
      }
    },
    [account.isConnected, writeContract, startTransaction, endTransaction],
  );

  const getCurrentFlowState = useCallback<() => typeof flowState>(() => {
    if (hash && isSuccess) {
      return "sold";
    }

    if (hash && isLoading) {
      return "waitingSell";
    }

    return null;
  }, [hash, isSuccess, isLoading]);

  useEffect(() => {
    const handleReceiptChange = async () => {
      const newFlowState = getCurrentFlowState();

      if (flowState != newFlowState) {
        setFlowState(newFlowState);
        soonerToast.dismiss(toastIdRef.current || "");
      } else {
        return;
      }

      if (hash && isSuccess) {
        toastIdRef.current = toast(
          { title: "Successfully sold shares", dismissable: false },
          { duration: 5 * 1_000 },
        );

        // Call onSuccess callback if provided
        if (onSuccessRef.current) {
          onSuccessRef.current();
        }

        onSuccessRef.current = null;
        endTransaction();
        setTimeout(() => {
          router.refresh();
        }, 2000);
        return;
      }

      if (hash && isLoading) {
        toastIdRef.current = toast(
          { title: "Selling shares...", dismissable: false, loading: true },
          { duration: 999 * 1_000 },
        );
        return;
      }
    };
    handleReceiptChange();
  }, [
    hash,
    isLoading,
    isSuccess,
    flowState,
    router,
    getCurrentFlowState,
    startWriteFlow,
    endTransaction,
  ]);

  useEffect(() => {
    return () => {
      if (toastIdRef.current) {
        soonerToast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    };
  }, []);

  return {
    startWriteFlow,
    isPending: isPending,
    isConfirming: isLoading,
  };
};
