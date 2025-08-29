"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { usePathname } from "next/navigation";
import { toast as sonnerToast } from "sonner";

interface TransactionContextType {
  isTransactionInProgress: boolean;
  startTransaction: () => void;
  endTransaction: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const useTransactionContext = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error("useTransactionContext must be used within a TransactionProvider");
  }
  return context;
};

interface TransactionProviderProps {
  children: ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ children }) => {
  const [isTransactionInProgress, setIsTransactionInProgress] = useState(false);
  const pathname = usePathname();
  const previousPathname = useRef<string | null>(null);

  const startTransaction = useCallback(() => {
    setIsTransactionInProgress(true);
  }, []);

  const endTransaction = useCallback(() => {
    setIsTransactionInProgress(false);
  }, []);

  useEffect(() => {
    if (previousPathname.current && previousPathname.current !== pathname) {
      if (isTransactionInProgress) {
        setIsTransactionInProgress(false);
      }
      sonnerToast.dismiss();
    }
    previousPathname.current = pathname;
  }, [pathname, isTransactionInProgress]);

  const value: TransactionContextType = {
    isTransactionInProgress,
    startTransaction,
    endTransaction,
  };

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
};
