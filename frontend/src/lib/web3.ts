import {
  Abi,
  BaseError,
  ContractFunctionExecutionError,
  ContractFunctionExecutionErrorType,
  ContractFunctionRevertedError,
  decodeErrorResult,
  SimulateContractErrorType,
  WaitForTransactionReceiptErrorType,
  WriteContractErrorType,
} from "viem";

interface ParseEvmTransactionLogArgs<TAbi extends Abi | readonly unknown[]> {
  abi: TAbi;
  error:
    | ContractFunctionExecutionErrorType
    | SimulateContractErrorType
    | WriteContractErrorType
    | WaitForTransactionReceiptErrorType
    | unknown
    | null;
}

export const decodeEvmTransactionErrorResult = <TAbi extends Abi | readonly unknown[]>({
  error,
  abi,
}: ParseEvmTransactionLogArgs<TAbi>) => {
  try {
    if (error instanceof BaseError || error instanceof ContractFunctionExecutionError) {
      const revertError = error.walk((err) => err instanceof ContractFunctionRevertedError);
      if (revertError instanceof ContractFunctionRevertedError) {
        const errorName = revertError.data?.errorName ?? "";

        if (errorName) {
          // This error is already decoded
          const decodedError = revertError.data;

          if (decodedError?.args && Array.isArray(decodedError.args)) {
            return { error, decodedError, arg: decodedError.args[0] };
          }

          if (decodedError?.args && !Array.isArray(decodedError.args)) {
            return { error, decodedError, arg: decodedError.args };
          }

          return { error, decodedError };
        }
      }
    }

    if (
      error instanceof Error &&
      error?.cause instanceof ContractFunctionRevertedError &&
      error?.cause?.signature
    ) {
      const decodedError = decodeErrorResult({
        abi,
        data: error?.cause?.signature,
      });

      if (decodedError?.args && Array.isArray(decodedError.args)) {
        return { error, decodedError, arg: decodedError.args[0] };
      }

      if (decodedError?.args && !Array.isArray(decodedError.args)) {
        return { error, decodedError, arg: decodedError.args };
      }

      return { decodedError, error };
    }
    return { error, decodedError: undefined };
  } catch {
    return { error, decodedError: undefined };
  }
};
