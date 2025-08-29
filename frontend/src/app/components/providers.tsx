"use client";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, cookieToInitialState } from "wagmi";
import { seiTestnet } from "viem/chains";

import { config } from "@/lib/wagmi";
import { USDBalanceProvider } from "@/app/contexts/BalanceContext";
import { TransactionProvider } from "@/app/contexts/TransactionContext";
const queryClient = new QueryClient();

type Props = {
  children: React.ReactNode;
  cookie?: string | null;
};

export function Providers({ children, cookie }: Props) {
  const initialState = cookieToInitialState(config, cookie);

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={seiTestnet}
          showRecentTransactions={false}
          theme={{
            blurs: {
              modalOverlay: "blur(8px)",
            },
            colors: {
              accentColor: "#9D1F19",
              accentColorForeground: "#1A1A1A",
              actionButtonBorder: "rgba(255, 255, 255, 0.1)",
              actionButtonBorderMobile: "rgba(255, 255, 255, 0.1)",
              actionButtonSecondaryBackground: "#2A2A2A",
              closeButton: "#FFFFFF",
              closeButtonBackground: "#1A1A1A",
              connectButtonBackground: "#9D1F19",
              connectButtonBackgroundError: "#FF4444",
              connectButtonInnerBackground: "#1A1A1A",
              connectButtonText: "#1A1A1A",
              connectButtonTextError: "#FFFFFF",
              connectionIndicator: "#9D1F19",
              downloadBottomCardBackground: "#1A1A1A",
              downloadTopCardBackground: "#2A2A2A",
              error: "#FF4444",
              generalBorder: "rgba(157, 31, 25, 0.2)",
              generalBorderDim: "rgba(255, 255, 255, 0.05)",
              menuItemBackground: "#2A2A2A",
              modalBackdrop: "rgba(0, 0, 0, 0.6)",
              modalBackground: "#1A1A1A",
              modalBorder: "rgba(157, 31, 25, 0.2)",
              modalText: "#FFFFFF",
              modalTextDim: "#AAAAAA",
              modalTextSecondary: "#CCCCCC",
              profileAction: "#2A2A2A",
              profileActionHover: "#3A3A3A",
              profileForeground: "#1A1A1A",
              selectedOptionBorder: "rgba(157, 31, 25, 0.3)",
              standby: "#9D1F19",
            },
            fonts: {
              body: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            },
            radii: {
              actionButton: "12px",
              connectButton: "12px",
              menuButton: "12px",
              modal: "20px",
              modalMobile: "20px",
            },
            shadows: {
              connectButton: "0 4px 12px rgba(157, 31, 25, 0.3)",
              dialog: "0 20px 40px rgba(0, 0, 0, 0.4)",
              profileDetailsAction: "0 2px 4px rgba(0, 0, 0, 0.2)",
              selectedOption: "0 2px 4px rgba(157, 31, 25, 0.2)",
              selectedWallet: "0 2px 4px rgba(157, 31, 25, 0.2)",
              walletLogo: "0 2px 4px rgba(0, 0, 0, 0.2)",
            },
          }}
        >
          <USDBalanceProvider>
            <TransactionProvider>{children}</TransactionProvider>
          </USDBalanceProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
