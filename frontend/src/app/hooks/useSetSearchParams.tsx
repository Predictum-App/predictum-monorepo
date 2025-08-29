import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const useSetSearchParams = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const assignParam = useCallback((params: URLSearchParams, key: string, value: string) => {
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  }, []);

  const setURLParams = useCallback(
    (newParams: { [key: string]: string }) => {
      const params = new URLSearchParams(searchParams);

      if (Object.keys(newParams).length === 0) {
        return;
      }

      Object.entries(newParams).forEach(([param, value]) => {
        assignParam(params, param, value);
      });

      replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [assignParam, searchParams, pathname, replace],
  );

  return setURLParams;
};
