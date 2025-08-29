"use client";

import { ChangeEvent, FC, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import { LoaderCircleIcon } from "lucide-react";
import { useAccount } from "wagmi";

import { cn, trimTrailingZero } from "@/lib/utils";
import { CreateMarketData } from "@/lib/types";

import { useCreateMarket, useSetSearchParams } from "@/app/hooks";
import { getCreateMarketValidationSchema } from "@/lib/validationSchemas";
import { useUSDBalanceContext } from "@/app/contexts/BalanceContext";
import { DateTimePicker } from "@/app/components/ui/date-time-picker";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";

import { FormErrors } from "./FormErrors";

type Props = {
  question?: string;
};

export const CreateMarketForm: FC<Props> = ({ question }: Props) => {
  const { address: account } = useAccount();
  const router = useRouter();
  const setURLParams = useSetSearchParams();
  const usdBalanceData = useUSDBalanceContext();

  const handleMarketCreated = useCallback(
    (address: string) => {
      setTimeout(() => {
        router.push(`/markets/${address}`);
      }, 2000);
    },
    [router],
  );

  const { createMarket, isPending, isConfirming, isUploadingImage } = useCreateMarket({
    onMarketCreate: handleMarketCreated,
  });

  const [imageName, setImageName] = useState("");

  const formik = useFormik<CreateMarketData>({
    initialValues: {
      question: question || "",
      outcomeNames: ["Yes", "No"],
      initialLiquidity: "10",
      closeDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      resolveDelay: 60,
      feeBPS: 0.5,
    },
    validationSchema: getCreateMarketValidationSchema(usdBalanceData.usdBalance),
    onSubmit: async (values) => {
      formik.validateForm();
      await createMarket(values);
    },
  });

  const handleOutcomeChange = (index: number, value: string) => {
    const values = [...formik.values.outcomeNames];
    values[index] = value;
    formik.setFieldValue("outcomeNames", values);
  };

  const handleQuestionChange = (_question: string) => {
    setURLParams({ question: _question });
    formik.setFieldValue("question", _question);
  };

  const imageOnChangeHandler = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file) {
      setImageName(file?.name);
      formik.setFieldValue("image", file);
    }
  };

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <label className="block text-sm font-medium text-gray-200 mb-3">Image:</label>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-md glow-border border border-input bg-gray-800/60 px-4 text-base md:text-sm ring-offset-background focus-visible:outline-none focus:outline-none focus:glow-border-focus transition-all duration-200 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
          <span
            className={`${formik.values.image ? "text-white" : "text-white-subtle"}  text-base md:text-sm`}
          >
            {formik.values.image ? imageName : "Add Image"}
          </span>
          <div className="flex sm:flex-row items-center space-x-2">
            <span className="text-white-subtle text-base md:text-sm">Drag Here or</span>
            <label className="bg-white-subtle text-white px-4 sm:py-4 rounded-md cursor-pointer text-base md:text-sm">
              Choose File
              <input
                type="file"
                name="image"
                accept="image/*"
                className="hidden"
                onChange={imageOnChangeHandler}
              />
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-3">Question:</label>
        <Input
          defaultValue={question || ""}
          onChange={(e) => handleQuestionChange(e.target.value)}
          required
          placeholder="What will happen?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-3">Outcomes:</label>
        <div className="mb-4">
          <Input
            value={formik.values.outcomeNames[0]}
            onChange={(e) => handleOutcomeChange(0, e.target.value)}
            required
            placeholder="Outcome 0"
          />
        </div>
        <div>
          <Input
            value={formik.values.outcomeNames[1]}
            onChange={(e) => handleOutcomeChange(1, e.target.value)}
            required
            placeholder="Outcome 1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-3">End Date:</label>
        <div className="relative">
          <DateTimePicker
            date={formik.values.closeDate}
            setDate={(date) => formik.setFieldValue("closeDate", date)}
            min={new Date()}
            buttonClassName="w-full px-4 py-4"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-3">
          Initial Liquidity (USDC):
        </label>
        <Input
          type="number"
          step="0.01"
          value={formik.values.initialLiquidity}
          onChange={(e) =>
            formik.setFieldValue("initialLiquidity", trimTrailingZero(e.target.value))
          }
          required
          placeholder="0.1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-3">
          Liquidity providers fee:
        </label>
        <div className="relative">
          <Input
            type="number"
            step="0.01"
            min={0}
            max={2}
            value={formik.values.feeBPS}
            onChange={(e) => formik.setFieldValue("feeBPS", trimTrailingZero(e.target.value))}
            required
            placeholder="0.1"
            className="pr-10 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0"
            style={{
              MozAppearance: "textfield",
            }}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
            %
          </span>
        </div>
      </div>

      <FormErrors errors={formik.errors} />

      <div className="pt-4">
        <Button
          type="submit"
          disabled={isPending || isUploadingImage || isConfirming || !account}
          className="w-full px-8 py-5 text-dark-950 rounded-xl font-semibold text-lg hover:bg-sei-300 shadow-lg shadow-sei-400/20 transition-all duration-200 hover:scale-[1.02]"
        >
          {isPending ? (
            <div className="flex items-center justify-center gap-2">
              <LoaderCircleIcon className={cn("animate-spin")} />
              <span>Confirming...</span>
            </div>
          ) : isUploadingImage ? (
            <div className="flex items-center justify-center gap-2">
              <LoaderCircleIcon className={cn("animate-spin")} />
              <span>Uploading Image...</span>
            </div>
          ) : (
            "Create Market"
          )}
        </Button>
      </div>
    </form>
  );
};
