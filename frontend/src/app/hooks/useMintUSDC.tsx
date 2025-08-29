import { useCallback, useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { simulateContract } from "wagmi/actions";
import { parseUnits, zeroAddress } from "viem";
import { toast } from "sonner";

import { MockERC20ABI } from "@/abis";
import { useUSDBalanceContext } from "@/app/contexts/BalanceContext";
import { config } from "@/lib/wagmi";

export const useMintUSDC = () => {
  const [hasMounted, setHasMounted] = useState(false);

  const account = useAccount();
  const { usdAddress } = useUSDBalanceContext();
  const [amount, setAmount] = useState<string>("");
  const [supportsMinting, setSupportsMinting] = useState<boolean | null>(null);

  const { data: hashMint, writeContract: writeMint, isPending: isMintPending } = useWriteContract();

  const { isLoading: isConfirmingMint, isSuccess: isConfirmedMint } = useWaitForTransactionReceipt({
    hash: hashMint,
  });

  useEffect(() => setHasMounted(true), []);

  useEffect(() => {
    if (usdAddress && usdAddress !== zeroAddress && hasMounted) {
      const checkMintingSupport = async () => {
        try {
          await simulateContract(config, {
            address: usdAddress,
            abi: MockERC20ABI,
            functionName: "mint",
            args: [account.address || zeroAddress, parseUnits("1", 6)],
          });
          setSupportsMinting(null);
        } catch {
          setSupportsMinting(false);
        }
      };

      checkMintingSupport();
    }
  }, [usdAddress, account.address, hasMounted]);

  const mintUSDC = useCallback(
    async (mintAmount: string) => {
      if (!account.address) {
        toast.error("Please connect your wallet");
        return;
      }

      if (!usdAddress || usdAddress === zeroAddress) {
        toast.error("USDC address not available");
        return;
      }

      try {
        const amountInWei = parseUnits(mintAmount, 6);

        writeMint({
          address: usdAddress,
          abi: MockERC20ABI,
          functionName: "mint",
          args: [account.address, amountInWei],
        });
      } catch (mintError) {
        console.log("Minting failed:", mintError);
        if (mintError instanceof Error && mintError.message.includes("execution reverted")) {
          toast.error(
            "Minting failed. You might not have permission to mint or this is real USDC.",
          );
        } else {
          toast.error("This USDC contract doesn't support minting. It might be real USDC.");
        }
      }
    },
    [account.address, usdAddress, writeMint],
  );

  return {
    amount,
    setAmount,
    mintUSDC,
    supportsMinting,
    isMintPending,
    isConfirmingMint,
    isConfirmedMint,
    hashMint,
  };
};
