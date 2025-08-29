import { USDCABI } from "@/abis";
import { marketFactory } from "@/lib/contracts";
import { BalanceData } from "@/lib/types";
import { createContext, useContext, useEffect } from "react";
import { zeroAddress } from "viem";
import { useAccount, useReadContract, useBlockNumber } from "wagmi";

const USDBalanceContext = createContext<BalanceData>({
  usdAddress: zeroAddress,
  usdBalance: BigInt("0"),
  isLoadingUSDCAddress: false,
  isLoadingBalance: false,
});

type Props = {
  children: React.ReactNode;
};

export const USDBalanceProvider: React.FC<Props> = ({ children }) => {
  const account = useAccount();

  const { data: usdc, isLoading: isLoadingUSDCAddress } = useReadContract({
    ...marketFactory,
    functionName: "USDC",
  });

  const {
    data: usdcBalance,
    isLoading: isLoadingBalance,
    refetch,
  } = useReadContract({
    address: usdc,
    abi: USDCABI,
    functionName: "balanceOf",
    args: [account.address || "0x"],
    query: {
      enabled: !!usdc,
    },
  });

  const { data: blockNumber } = useBlockNumber({ watch: true });

  useEffect(() => {
    if (blockNumber && blockNumber % BigInt("2") === BigInt("0")) refetch();
    refetch();
  }, [blockNumber, refetch]);

  let usdBalance = usdcBalance;
  if (!account.address || !usdBalance) {
    usdBalance = BigInt("0");
  }
  return (
    <USDBalanceContext.Provider
      value={{
        usdAddress: usdc || zeroAddress,
        usdBalance: usdBalance,
        isLoadingUSDCAddress,
        isLoadingBalance,
      }}
    >
      {children}
    </USDBalanceContext.Provider>
  );
};

export function useUSDBalanceContext() {
  return useContext(USDBalanceContext);
}
