"use client";

import { cn } from "@/lib/utils";
import { LoaderCircleIcon, XIcon } from "lucide-react";
import { ExternalToast, toast as sonnerToast } from "sonner";

export function toast(toast: Omit<ToastProps, "id">, settings?: ExternalToast) {
  return sonnerToast.custom((id) => <Toast id={id} {...toast} />, settings);
}

type ToastProps = {
  id: string | number;
  title: string;
  error?: boolean;
  loading?: boolean;
  dismissable?: boolean;
};

function Toast({ title, id, dismissable, error, loading }: ToastProps) {
  return (
    <div
      className={cn(
        "flex rounded-lg text-primary-foreground text-sm font-medium shadow-lg ring-1 ring-black/5 w-full md:max-w-[484px] items-center p-4",
        error && "bg-red-400",
        !error && "bg-sei-400",
      )}
    >
      <div className="flex gap-2 items-center">
        {loading && <LoaderCircleIcon className={cn("animate-spin")} />}

        <p>{title}</p>
      </div>
      {dismissable && (
        <div className="ml-5 shrink-0">
          <XIcon
            size={16}
            className="cursor-pointer"
            onClick={() => {
              sonnerToast.dismiss(id);
            }}
          />
        </div>
      )}
    </div>
  );
}
