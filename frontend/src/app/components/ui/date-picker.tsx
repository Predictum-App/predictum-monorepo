"use client";

import { Dispatch, FC, SetStateAction } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Calendar } from "@/app/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = {
  date: Date;
  setDate: Dispatch<SetStateAction<Date | undefined>>;
  buttonClassName?: string;
};

export const DatePicker: FC<Props> = ({ date, setDate, buttonClassName }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"glow"}
          size={"custom"}
          data-empty={!date}
          className={cn(
            "data-[empty=true]:text-muted-foreground justify-start text-left font-normal",
            buttonClassName,
          )}
        >
          <CalendarIcon />
          {date ? format(date, "PPP pp") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={setDate} />
      </PopoverContent>
    </Popover>
  );
};
