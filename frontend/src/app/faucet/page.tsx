"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";

import { Button } from "@/app/components/ui/button";
import { NumberInput } from "@/app/components/ui/number-input";
import { useMintUSDC } from "@/app/hooks";
import { useUSDBalanceContext } from "@/app/contexts/BalanceContext";

export default function FaucetPage() {
  const { isConnected } = useAccount();
  const { usdBalance, isLoadingBalance } = useUSDBalanceContext();

  const {
    amount,
    setAmount,
    mintUSDC,
    supportsMinting,
    isMintPending,
    isConfirmingMint,
    isConfirmedMint,
  } = useMintUSDC();

  useEffect(() => {
    if (isConfirmedMint) {
      setAmount("");
    }
  }, [isConfirmedMint, setAmount]);

  const handleMint = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }
    await mintUSDC(amount);
  };

  if (!isConnected) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        {/* Main Content */}
        <div className="relative max-w-7xl mx-auto px-8">
          <div className="text-center pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
              <h1 className="font-space-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                USDC Faucet
              </h1>
              <p className="text-lg sm:text-xl text-dark-200 leading-relaxed font-light">
                Please connect your wallet to use the faucet
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-8">
        {/* Page Title Section */}
        <div className="text-center pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            <h1 className="font-space-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Faucet
            </h1>
            <p className="text-lg sm:text-xl text-dark-200 leading-relaxed font-light">
              Mint test tokens for testing prediction markets
            </p>
          </div>
        </div>

        {/* Faucet Card */}
        <div className="flex justify-center pb-20">
          <div className="w-full max-w-md">
            <div className="bg-dark-800/60 glow-border rounded-3xl p-6 sm:p-8 shadow-2xl shadow-sei-400/5 backdrop-blur-sm">
              {/* Current Balance */}
              <div className="mb-8 p-6 bg-dark-700/40 border border-dark-600/30 rounded-2xl">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-dark-300 text-sm font-medium">Current Balance</span>
                </div>
                <div className="text-3xl font-bold text-white font-space-grotesk">
                  {isLoadingBalance ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-6 h-6 border-2 border-dark-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-dark-400">Loading...</span>
                    </div>
                  ) : (
                    `$${formatUnits(usdBalance, 6)}`
                  )}
                </div>
              </div>

              {/* Mint Form */}
              {supportsMinting === false ? (
                <div className="p-6 bg-yellow-900/20 border border-yellow-700/30 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-yellow-900/30 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-yellow-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                    </div>
                    <span className="text-yellow-400 font-medium">Real USDC Detected</span>
                  </div>
                  <p className="text-yellow-300 text-sm leading-relaxed">
                    This USDC contract doesn&apos;t support minting. It appears to be real USDC, not
                    a test token.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="amount"
                      className="block text-sm font-medium text-dark-300 mb-3"
                    >
                      Amount to Mint
                    </label>
                    <NumberInput
                      id="amount"
                      placeholder="Enter amount (e.g., 1000)"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      decimals={6}
                    />
                  </div>

                  <Button
                    onClick={handleMint}
                    disabled={
                      !amount || parseFloat(amount) <= 0 || isMintPending || isConfirmingMint
                    }
                    className="w-full px-6 py-3 bg-sei-400 text-dark-950 rounded-xl font-semibold text-base hover:bg-sei-300 transition-all duration-200 shadow-lg shadow-sei-400/20 hover:shadow-xl hover:shadow-sei-400/30 transform hover:-translate-y-0.5 disabled:transform-none disabled:opacity-50"
                  >
                    {isMintPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin"></div>
                        <span>Confirming...</span>
                      </div>
                    ) : isConfirmingMint ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin"></div>
                        <span>Minting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Mint</span>
                      </div>
                    )}
                  </Button>
                </div>
              )}

              {/* Info */}
              <div className="mt-8 p-6 bg-dark-700/20 border border-dark-600/20 rounded-2xl backdrop-blur-sm">
                <p className="text-dark-300 text-sm leading-relaxed">
                  {supportsMinting === false
                    ? "This appears to be a real contract. The faucet is only available for test tokens."
                    : "This faucet allows you to mint test tokens. These tokens are only for testing purposes and have no real value."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
