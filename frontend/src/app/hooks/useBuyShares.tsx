import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { readContract, simulateContract } from "wagmi/actions";
import { parseUnits, zeroAddress } from "viem";
import { toast as soonerToast } from "sonner";
import { getUnixTime } from "date-fns";

import { MarketABI, USDCABI } from "@/abis";

import { BuySharesData } from "@/lib/types";
import { marketFactory } from "@/lib/contracts";
import { config } from "@/lib/wagmi";
import { decodeEvmTransactionErrorResult } from "@/lib/web3";

import { toast } from "@/app/components/ui/toast";
import { useUSDBalanceContext } from "@/app/contexts/BalanceContext";
import { useTransactionContext } from "@/app/contexts/TransactionContext";

export const useBuyShares = () => {
  const router = useRouter();
  const { startTransaction, endTransaction } = useTransactionContext();

  const account = useAccount();
  const usdData = useUSDBalanceContext();

  const [flowState, setFlowState] = useState<
    "waitingApprove" | "approved" | "waitingBuy" | "bought" | null
  >(null);
  const toastIdRef = useRef<string | number | null>(null);
  const callData = useRef<BuySharesData | null>(null);
  const onSuccessRef = useRef<(() => void) | null>(null);

  const {
    data: hashUSDApproval,
    writeContract: writeApproval,
    isPending: isApprovalPending,
    error: approvalError,
  } = useWriteContract();

  const {
    data: hashAction,
    writeContract: writeAction,
    isPending: isActionPending,
    error: actionError,
  } = useWriteContract();

  const { isLoading: isConfirmingApproval, isSuccess: isConfirmedApproval } =
    useWaitForTransactionReceipt({
      hash: hashUSDApproval,
    });

  const { isLoading: isConfirmingAction, isSuccess: isConfirmedAction } =
    useWaitForTransactionReceipt({
      hash: hashAction,
    });

  useEffect(() => {
    if (approvalError) {
      endTransaction();
    }
  }, [approvalError, endTransaction]);

  useEffect(() => {
    if (actionError) {
      endTransaction();
    }
  }, [actionError, endTransaction]);

  const getAllowance = useCallback(async () => {
    try {
      const allowance = await readContract(config, {
        address: usdData.usdAddress,
        abi: USDCABI,
        functionName: "allowance",
        args: [account.address || zeroAddress, callData.current?.address || zeroAddress],
      });
      return allowance;
    } catch (error) {
      console.log(error);
      throw new Error("Failed to get USD allowance");
    }
  }, [usdData, account]);

  const startWriteFlow = useCallback(
    async (data: BuySharesData, onSuccess?: () => void) => {
      callData.current = data;
      onSuccessRef.current = onSuccess || null;

      startTransaction();

      try {
        if (!account.isConnected) {
          throw new Error("Please connect your wallet");
        }

        const amount = parseUnits(data.amount, 6);
        const minShares = BigInt(0);
        const deadline = BigInt((getUnixTime(new Date()) + 5 * 60).toString());
        const allowance = await getAllowance();

        if (allowance < amount) {
          writeApproval({
            address: usdData.usdAddress,
            abi: USDCABI,
            functionName: "approve",
            args: [data.address, allowance + amount],
          });
          return;
        }

        try {
          const actionCall = {
            address: data.address,
            abi: MarketABI,
            functionName: "buyShares",
            args: [amount, BigInt(data.outcomeIndex.toString()), minShares, deadline],
          } as const;
          await simulateContract(config, actionCall);
          writeAction(actionCall);
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

          throw new Error("Failed to buy shares");
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
    [
      usdData,
      account.isConnected,
      getAllowance,
      writeApproval,
      writeAction,
      startTransaction,
      endTransaction,
    ],
  );

  const getCurrentFlowState = useCallback<() => typeof flowState>(() => {
    if (hashAction && isConfirmedAction) {
      return "bought";
    }

    if (hashAction && isConfirmingAction) {
      return "waitingBuy";
    }

    if (hashUSDApproval && isConfirmedApproval) {
      return "approved";
    }

    if (hashUSDApproval && isConfirmingApproval) {
      return "waitingApprove";
    }

    return null;
  }, [
    hashUSDApproval,
    hashAction,
    isConfirmingApproval,
    isConfirmedApproval,
    isConfirmingAction,
    isConfirmedAction,
  ]);

  useEffect(() => {
    const handleReceiptChange = async () => {
      const newFlowState = getCurrentFlowState();

      if (flowState != newFlowState) {
        setFlowState(newFlowState);
        soonerToast.dismiss(toastIdRef.current || "");
      } else {
        return;
      }

      if (hashAction && isConfirmedAction) {
        toastIdRef.current = toast(
          { title: "Successfully bought shares", dismissable: false },
          { duration: 5 * 1_000 },
        );

        // Call onSuccess callback if provided
        if (onSuccessRef.current) {
          onSuccessRef.current();
        }

        callData.current = null;
        onSuccessRef.current = null;
        endTransaction();
        setTimeout(() => {
          router.refresh();
        }, 2000);
        return;
      }

      if (hashAction && isConfirmingAction) {
        toastIdRef.current = toast(
          { title: "Buying shares...", dismissable: false, loading: true },
          { duration: 999 * 1_000 },
        );
        return;
      }

      if (hashUSDApproval && isConfirmedApproval) {
        toastIdRef.current = toast(
          { title: "Successful USD approval", dismissable: false },
          { duration: 5 * 1_000 },
        );
        if (callData.current) {
          await startWriteFlow(callData.current, onSuccessRef.current || undefined);
        }
        return;
      }

      if (hashUSDApproval && isConfirmingApproval) {
        toastIdRef.current = toast(
          { title: "Approving market...", dismissable: false, loading: true },
          { duration: 999 * 1_000 },
        );
        return;
      }
    };
    handleReceiptChange();
  }, [
    hashUSDApproval,
    hashAction,
    isConfirmedApproval,
    isConfirmingAction,
    isConfirmingApproval,
    isConfirmedAction,
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
    isPending: isApprovalPending || isActionPending,
    isConfirming: isConfirmingApproval || isConfirmingAction,
  };
};
