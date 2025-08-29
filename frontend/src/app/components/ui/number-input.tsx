import { forwardRef, ComponentProps, ChangeEvent } from "react";

import { escapeSpecialRegExpChars, limitDecimals } from "@/lib/utils";

import { Input } from "./input";

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`);

const NumberInput = forwardRef<HTMLInputElement, ComponentProps<"input"> & { decimals?: number }>(
  (props, ref) => {
    async function onChange(e: ChangeEvent<HTMLInputElement>) {
      if (!props.onChange) return;

      // Remove commas to process the value
      let newValue = e.target.value.replace(/,/g, "");

      // Replace comma with dot
      newValue = newValue.replace(/,/g, ".");
      if (newValue === ".") {
        newValue = "0.";
      }

      // Remove leading zero unless it's "0." or just "0"
      if (
        newValue.length > 1 &&
        newValue.startsWith("0") &&
        !newValue.startsWith("0.") &&
        !newValue.startsWith("0,") &&
        !newValue.startsWith("0e") // allow scientific notation if needed
      ) {
        // Remove all leading zeros, but keep one if the next char is not a dot
        newValue = newValue.replace(/^0+/, "");
        if (newValue === "" || newValue[0] === ".") {
          newValue = "0" + newValue;
        }
      }

      if (newValue === "" || inputRegex.test(escapeSpecialRegExpChars(newValue))) {
        newValue = limitDecimals(newValue, props.decimals);
        e.target.value = newValue;

        await props.onChange(e);
      }
    }

    const displayValue = props.value?.toLocaleString();

    return (
      <Input
        ref={ref}
        {...props}
        autoComplete="off"
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={onChange}
      />
    );
  },
);
NumberInput.displayName = "NumberInput";

export { NumberInput };
