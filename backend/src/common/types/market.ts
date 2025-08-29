export type TAIRequiredMarketData = {
  question: string;
  askedAt: Date;
  outcomes: string[];
  closeTime: number;
  resolveDelay: number;
  state: number;
  oracleAddress: `0x${string}`;
};

export type TAIOutcomeResult = {
  outcome: string;
  outcomeIndex: number;
  voided: boolean;
} | null;
