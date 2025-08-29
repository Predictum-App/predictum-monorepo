import { formatUnits } from "viem";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isInEnum = <T extends object>(enumObject: T, value: unknown): value is T[keyof T] => {
  return Object.values(enumObject).includes(value);
};

export const formatPrice = (price: number) => {
  return (price * 100).toFixed(1) + "¢";
};

export const nFormatter = (
  number: number | null | undefined | string,
  decimals: number = 2,
  symbol: string | null = null,
  thousands: boolean = false,
) => {
  if (number === undefined || number === null) {
    return "...";
  }

  if (thousands) {
    const lookup = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: "k" },
      { value: 1e6, symbol: "M" },
      { value: 1e9, symbol: "B" },
      { value: 1e12, symbol: "T" },
      { value: 1e15, symbol: "P" },
      { value: 1e18, symbol: "E" },
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    const item = lookup
      .slice()
      .reverse()
      .find(function (item) {
        return Math.abs(Number(number)) >= item.value;
      });

    if (!item) {
      // Handle the case where the input value is 0
      return Number("0").toFixed(decimals);
    }
    const formattedValue = item
      ? (Math.abs(Number(number)) / item.value).toFixed(decimals).replace(rx, "$1")
      : "0";

    return Number(number) < 0
      ? `-${symbol}${formattedValue}${item?.symbol}`
      : `${symbol}${formattedValue}${item?.symbol}`;
  }

  let n = new Intl.NumberFormat("en-UK", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(Math.abs(Number(number)));

  if (symbol) {
    if (Number(number) >= 0) {
      n = symbol.concat(n);
    } else {
      n = "-".concat(symbol.concat(n));
    }
  } else if (Number(number) < 0) {
    n = "-".concat(n);
  }
  return n;
};

export function getTimeProgress(
  startTimestampMs: number,
  endTimestampMs: number,
  currentTimestampMs: number,
): number {
  // Calculate the total duration in milliseconds
  const totalDuration = endTimestampMs - startTimestampMs;

  // Calculate the elapsed duration in milliseconds
  const elapsedDuration = currentTimestampMs - startTimestampMs;

  // Ensure that the current timestamp is within the start and end timestamps
  if (currentTimestampMs < startTimestampMs) {
    return 0; // Early, not yet started
  } else if (currentTimestampMs > endTimestampMs) {
    return 100; // Already finished
  }

  // Calculate the progress percentage
  const progressPercentage = (elapsedDuration / totalDuration) * 100;

  return progressPercentage;
}

export const escapeSpecialRegExpChars = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const formatNumberWithCommas = (_value: string | bigint): string => {
  const value = _value.toString();
  const parts = value.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

export const limitDecimals = (amount: string, maxDecimals?: number) => {
  let amountStr = amount.toString();
  if (maxDecimals === undefined) {
    return amountStr;
  }
  if (maxDecimals === 0) {
    return amountStr.split(".")[0];
  }
  const dotIndex = amountStr.indexOf(".");
  if (dotIndex !== -1) {
    const decimals = amountStr.length - dotIndex - 1;
    if (decimals > maxDecimals) {
      amountStr = amountStr.substr(0, amountStr.length - (decimals - maxDecimals));
    }
  }
  return amountStr;
};
export const padDecimals = (amount: string, minDecimals: number) => {
  let amountStr = amount.toString();
  const dotIndex = amountStr.indexOf(".");
  if (dotIndex !== -1) {
    const decimals = amountStr.length - dotIndex - 1;
    if (decimals < minDecimals) {
      amountStr = amountStr.padEnd(amountStr.length + (minDecimals - decimals), "0");
    }
  } else {
    amountStr = amountStr + ".0000";
  }
  return amountStr;
};

export function numberWithCommas(x: string) {
  if (!x) {
    return "...";
  }

  const parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

export const formatAmount = (
  amount: bigint | undefined,
  tokenDecimals: number,
  displayDecimals?: number,
  useCommas?: boolean,
  defaultValue?: string,
) => {
  if (!defaultValue) {
    defaultValue = "0";
  }
  if (amount === undefined || amount.toString().length === 0) {
    return defaultValue;
  }
  if (displayDecimals === undefined) {
    displayDecimals = 4;
  }
  if (!amount) {
    return defaultValue;
  }
  let amountStr = formatUnits(amount, tokenDecimals);
  amountStr = limitDecimals(amountStr, displayDecimals);
  if (displayDecimals !== 0) {
    amountStr = padDecimals(amountStr, displayDecimals);
  }
  if (useCommas) {
    return numberWithCommas(amountStr);
  }
  return amountStr;
};

export const formatAmountWithRegex = (
  amount: bigint | undefined,
  tokenDecimals: number,
  displayDecimals?: number,
  useCommas?: boolean,
  defaultValue?: string,
) => {
  return formatAmount(amount, tokenDecimals, displayDecimals, useCommas, defaultValue)
    .replace(/(\.\d*?[1-9])0+$/g, "$1")
    .replace(/\.0+$/, "");
};

export const trimTrailingZero = (value: string) => {
  const trim = value.length > 1 && value.startsWith("0") && !value.startsWith("0.");
  if (trim) {
    value = value.slice(1);
  }
  return value;
};
