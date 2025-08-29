import { cookieStorage, createStorage, http } from "wagmi";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { seiTestnet } from "viem/chains";

export const config = getDefaultConfig({
  appName: "Predictions Market",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [seiTestnet],
  transports: {
    [seiTestnet.id]: http(),
  },
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
});

// Market Factory configuration
export const MARKET_FACTORY_CONFIG = {
  address: process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS!,
  chainId: seiTestnet.id,
};
