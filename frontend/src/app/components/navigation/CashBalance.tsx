import { FC } from "react";
import { useAccount } from "wagmi";

import { cn, formatAmountWithRegex, shimmer } from "@/lib/utils";
import { useUSDBalanceContext } from "@/app/contexts/BalanceContext";

type Props = {
  side: "start" | "end";
} & React.HTMLAttributes<HTMLDivElement>;

export const CashBalance: FC<Props> = ({ side, className, ...props }) => {
  const account = useAccount();

  const usdBalanceData = useUSDBalanceContext();

  if (!account.address) {
    return <></>;
  }

  return (
    <div {...props} className={cn("flex flex-col", `items-${side}`, className)}>
      <span className="text-gray-400 text-xs">Cash</span>
      {usdBalanceData.isLoadingUSDCAddress || usdBalanceData.isLoadingBalance ? (
        <div className="h-5 flex items-center">
          <div className="w-10 h-3 rounded bg-gray-700 text-sm relative overflow-hidden">
            <div className={shimmer}></div>
          </div>
        </div>
      ) : (
        <span className="text-green-400 text-sm font-semibold">
          ${Number(formatAmountWithRegex(usdBalanceData.usdBalance, 6, 2, false)).toFixed(2)}
        </span>
      )}
    </div>
  );
};
