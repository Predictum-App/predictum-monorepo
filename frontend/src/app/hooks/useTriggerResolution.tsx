import { useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast as soonerToast } from "sonner";
import { useRouter } from "next/navigation";

import { getMarketStateData } from "@/lib/contracts";
import { Market, MarketStateExtended } from "@/lib/types";

import { toast } from "@/app/components/ui/toast";
import { useAccount } from "wagmi";

export const useTriggerResolution = (market: Market) => {
  const account = useAccount();
  const router = useRouter();

  const toastIdRef = useRef<string | number | null>(null);

  const marketExtendedState = getMarketStateData(market);
  const mutation = useMutation({
    mutationFn: (newTodo) => {
      const marketExtendedState = getMarketStateData(market);

      if (toastIdRef.current) {
        soonerToast.dismiss(toastIdRef.current);
      }

      toastIdRef.current = toast(
        {
          title:
            marketExtendedState === MarketStateExtended.Closable
              ? "Closing Market..."
              : "Resolving Market...",
          loading: true,
          dismissable: false,
        },
        { duration: 99_000 },
      );

      return axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/markets/${market.address}?chainId=${account.chainId}`,
        newTodo,
      );
    },
    onError: (error) => {
      if (toastIdRef.current) {
        soonerToast.dismiss(toastIdRef.current);
      }

      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          const isSuccessClose = error.response.data?.message.includes("requires");
          toastIdRef.current = toast({
            title: isSuccessClose
              ? "Market closed"
              : error.response.data?.message ||
                `Failed to ${marketExtendedState === MarketStateExtended.Closable ? "close" : "resolve"} market`,
            error: !isSuccessClose,
            dismissable: true,
          });
          router.refresh();
          return;
        }
      }

      toastIdRef.current = toast({
        title: `Failed to ${marketExtendedState === MarketStateExtended.Closable ? "close" : "resolve"} market`,
        error: true,
        dismissable: true,
      });
    },
    onSuccess: () => {
      if (toastIdRef.current) {
        soonerToast.dismiss(toastIdRef.current);
      }

      toastIdRef.current = toast({
        title:
          marketExtendedState === MarketStateExtended.Closable
            ? "Market Closed"
            : "Market Resolved",
        loading: false,
        dismissable: true,
      });

      setTimeout(() => {
        router.refresh();
      }, 2_000);
    },
  });

  // Cleanup effect to dismiss toast when component unmounts or navigating away
  useEffect(() => {
    return () => {
      // Dismiss any active toast when component unmounts
      if (toastIdRef.current) {
        soonerToast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    };
  }, []);

  return { mutation };
};
