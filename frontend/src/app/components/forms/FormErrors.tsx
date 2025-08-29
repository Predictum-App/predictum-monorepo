import { FormikErrors } from "formik";

interface FormErrorsProps extends React.HTMLProps<HTMLDivElement> {
  errors: FormikErrors<{ [key: string]: string[] | string | Date | number | File }>;
}

export function FormErrors({ errors, ...rest }: FormErrorsProps) {
  return (
    <div {...rest}>
      {errors &&
        Object.entries(errors).map(([, error]) => (
          <p key={error} className="text-red-500 text-sm">
            {error}
          </p>
        ))}
    </div>
  );
}
