import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { simulateContract } from "wagmi/actions";
import { toast as soonerToast } from "sonner";

import { MarketABI } from "@/abis";

import { useTransactionContext } from "@/app/contexts/TransactionContext";

import { ClaimRewardsData } from "@/lib/types";
import { marketFactory } from "@/lib/contracts";
import { config } from "@/lib/wagmi";
import { decodeEvmTransactionErrorResult } from "@/lib/web3";

import { toast } from "@/app/components/ui/toast";

export const useClaimFees = () => {
  const router = useRouter();
  const { startTransaction, endTransaction } = useTransactionContext();

  const account = useAccount();

  const [flowState, setFlowState] = useState<"waiting" | "confirmed" | null>(null);
  const toastIdRef = useRef<string | number | null>(null);

  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash: hash });

  useEffect(() => {
    if (error) {
      endTransaction();
    }
  }, [error, endTransaction]);

  const startWriteFlow = useCallback(
    async (data: ClaimRewardsData) => {
      try {
        if (!account.isConnected) {
          throw new Error("Please connect your wallet");
        }
        startTransaction();

        try {
          const actionCall = {
            address: data.address,
            abi: MarketABI,
            functionName: "claimFees",
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

          throw new Error("Failed to claim fees");
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
      return "confirmed";
    }

    if (hash && isLoading) {
      return "waiting";
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
          { title: "Successfully claimed fees", dismissable: false },
          { duration: 5 * 1_000 },
        );
        endTransaction();
        setTimeout(() => {
          router.refresh();
        }, 2000);
        return;
      }

      if (hash && isLoading) {
        toastIdRef.current = toast(
          { title: "Claiming fees...", dismissable: false, loading: true },
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
