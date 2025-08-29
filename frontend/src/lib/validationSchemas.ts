import * as Yup from "yup";
import { formatAmountWithRegex } from "./utils";

export const getCreateMarketValidationSchema = (usdcBalance: bigint) => {
  let initialLiquidity = Yup.number()
    .moreThan(9.99, "Initial liquidity must be greater than 10 USD")
    .required("Initial liquidity is required")
    .typeError("Initial liquidity must be a number");

  const parsedBalance = Number(formatAmountWithRegex(usdcBalance, 6, 2, false));

  initialLiquidity = initialLiquidity.concat(
    initialLiquidity.max(parsedBalance, `Initial liquidity cannot exceed USD balance`),
  );

  return Yup.object({
    question: Yup.string()
      .required("Question is required")
      .test("len", "Question cannot be longer than 50 symbols", (val) => val.length <= 50),
    outcomeNames: Yup.array()
      .of(
        Yup.string()
          .required("Outcome names are required")
          .test(
            "len",
            "Outcome's name cannot be longer than 20 symbols",
            (val) => val.length <= 20,
          ),
      )
      .length(2, "Only two outcomes are supported"),
    initialLiquidity,
    closeDate: Yup.date().min(new Date(), "Close date must be in future"),
    resolveDelay: Yup.number()
      .min(60, "Resolve delay must be minimum 1 minute")
      .max(604800, "Resolve delay must less than 7 days")
      .typeError("Resolve delay must be a number"),
    feeBPS: Yup.number()
      .min(0, "LP fee cannot be negative")
      .max(200, "Maximum LP fee can be 2%")
      .typeError("LP fee must be a number"),
    image: Yup.mixed().required("Image is required"),
  });
};
