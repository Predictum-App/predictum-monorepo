import { useCallback, useEffect, useState, useRef } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { readContract, simulateContract } from "wagmi/actions";
import { parseUnits, zeroAddress } from "viem";
import { toast as soonerToast } from "sonner";
import axios from "axios";

import { USDCABI } from "@/abis";

import { CreateMarketData } from "@/lib/types";
import { marketFactory } from "@/lib/contracts";
import { config } from "@/lib/wagmi";
import { decodeEvmTransactionErrorResult } from "@/lib/web3";

import { toast } from "@/app/components/ui/toast";
import { useUSDBalanceContext } from "@/app/contexts/BalanceContext";

type Props = {
  onMarketCreate?: (address: string) => void;
};

export const useCreateMarket = ({ onMarketCreate }: Props) => {
  const account = useAccount();
  const usdData = useUSDBalanceContext();

  const [isUploadingImage, setUploadingImage] = useState<boolean>(false);
  const [newMarketAddress, setNewMarketAddress] = useState<string | null>(null);
  const [flowState, setFlowState] = useState<
    "waitingApprove" | "approved" | "waitingCreate" | "created" | null
  >(null);
  const toastIdRef = useRef<string | number | null>(null);
  const createMarketCallData = useRef<CreateMarketData | null>(null);

  const {
    data: hashUSDApproval,
    writeContract: writeApproval,
    isPending: isApprovalPending,
  } = useWriteContract();

  const {
    data: hashCreateMarket,
    writeContract: writeCreateMarket,
    isPending: isCreateMarketPending,
  } = useWriteContract();

  const { isLoading: isConfirmingApproval, isSuccess: isConfirmedApproval } =
    useWaitForTransactionReceipt({
      hash: hashUSDApproval,
    });

  const { isLoading: isConfirmingCreate, isSuccess: isConfirmedCreate } =
    useWaitForTransactionReceipt({
      hash: hashCreateMarket,
    });

  const getAllowance = useCallback(async () => {
    try {
      const allowance = await readContract(config, {
        address: usdData.usdAddress,
        abi: USDCABI,
        functionName: "allowance",
        args: [account.address || zeroAddress, marketFactory.address],
      });
      return allowance;
    } catch (error) {
      console.log(error);
      throw new Error("Failed to get USD allowance");
    }
  }, [usdData, account]);

  const createMarket = useCallback(
    async (data: CreateMarketData) => {
      setNewMarketAddress(null);

      if (!createMarketCallData.current) {
        createMarketCallData.current = data;
        createMarketCallData.current.marketURI = "";
        try {
          setUploadingImage(true);
          if (data.image) {
            const uploadFormData = new FormData();
            uploadFormData.append("file", data.image);
            uploadFormData.append("network", "public");

            const imageCID = await axios.post<string>("/api/upload-image", uploadFormData, {
              maxBodyLength: Infinity,
            });
            createMarketCallData.current.marketURI = `ipfs://${imageCID.data}`;
          }
          setUploadingImage(false);
        } catch {
          setUploadingImage(false);
        }
        if (!createMarketCallData.current.marketURI) {
          toast(
            { title: "Failed to upload image", error: true, dismissable: true },
            { duration: 5 * 1_000 },
          );
        }
      }

      try {
        if (!account.isConnected) {
          throw new Error("Please connect your wallet");
        }

        const initialLiquidity = parseUnits(createMarketCallData.current.initialLiquidity, 6);
        const feeBPS = parseUnits(createMarketCallData.current.feeBPS.toString(), 2);

        const allowance = await getAllowance();

        if (allowance < initialLiquidity) {
          writeApproval({
            address: usdData.usdAddress,
            abi: USDCABI,
            functionName: "approve",
            args: [marketFactory.address, allowance + initialLiquidity],
          });
          return;
        }

        try {
          const createMarketCall = {
            ...marketFactory,
            functionName: "createMarket",
            args: [
              createMarketCallData.current.marketURI || "",
              createMarketCallData.current.question,
              createMarketCallData.current.outcomeNames,
              BigInt(
                Math.round(createMarketCallData.current.closeDate.getTime() / 1000).toString(),
              ),
              initialLiquidity,
              BigInt(createMarketCallData.current.resolveDelay.toString()),
              feeBPS,
            ],
          } as const;
          const address = await simulateContract(config, createMarketCall);
          writeCreateMarket(createMarketCall);
          setNewMarketAddress(address.result);
        } catch (error) {
          console.log(error);

          setNewMarketAddress(null);
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

          throw new Error("Failed to create market");
        } finally {
          createMarketCallData.current = null;
        }
      } catch (error) {
        if (error instanceof Error) {
          console.log(error.message);
          soonerToast.dismiss(toastIdRef.current || "");
          toast({ title: error.message, error: true, dismissable: true }, { duration: 10 * 1_000 });
        }
        return;
      }
    },
    [usdData, account.isConnected, getAllowance, writeApproval, writeCreateMarket],
  );

  const getCurrentFlowState = useCallback<() => typeof flowState>(() => {
    if (hashCreateMarket && isConfirmedCreate) {
      return "created";
    }

    if (hashCreateMarket && isConfirmingCreate) {
      return "waitingCreate";
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
    hashCreateMarket,
    isConfirmingApproval,
    isConfirmedApproval,
    isConfirmingCreate,
    isConfirmedCreate,
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

      if (hashCreateMarket && isConfirmedCreate) {
        toastIdRef.current = toast(
          { title: "Successfully created market...", dismissable: false },
          { duration: 5 * 1_000 },
        );
        createMarketCallData.current = null;

        if (newMarketAddress) {
          setTimeout(async () => {
            await onMarketCreate?.(newMarketAddress);
          }, 2_000);
        }
        return;
      }

      if (hashCreateMarket && isConfirmingCreate) {
        toastIdRef.current = toast(
          { title: "Creating market...", dismissable: false, loading: true },
          { duration: 999 * 1_000 },
        );
        return;
      }

      if (hashUSDApproval && isConfirmedApproval) {
        toastIdRef.current = toast(
          { title: "Successful USD approval", dismissable: false },
          { duration: 5 * 1_000 },
        );
        if (createMarketCallData.current) {
          await createMarket(createMarketCallData.current);
        }
        return;
      }

      if (hashUSDApproval && isConfirmingApproval) {
        toastIdRef.current = toast(
          { title: "Approving market factory...", dismissable: false, loading: true },
          { duration: 999 * 1_000 },
        );
        return;
      }
    };
    handleReceiptChange();
  }, [
    hashUSDApproval,
    hashCreateMarket,
    isConfirmedApproval,
    isConfirmingCreate,
    isConfirmingApproval,
    isConfirmedCreate,
    newMarketAddress,
    flowState,
    getCurrentFlowState,
    onMarketCreate,
    createMarket,
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
    createMarket,
    isPending: isApprovalPending || isCreateMarketPending,
    isConfirming: isConfirmingApproval || isConfirmingCreate,
    isUploadingImage,
  };
};
