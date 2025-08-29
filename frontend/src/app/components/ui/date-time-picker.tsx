"use client";

import { Dispatch, FC, SetStateAction, useState } from "react";
import { format } from "date-fns";

import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import { Calendar } from "@/app/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/app/components/ui/scroll-area";

type Props = {
  date: Date;
  setDate: Dispatch<SetStateAction<Date | undefined>>;
  buttonClassName?: string;
  min?: Date;
};

export const DateTimePicker: FC<Props> = ({ date, setDate, buttonClassName, min }) => {
  const [isOpen, setIsOpen] = useState(false);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Preserve the current time if it exists
      if (date) {
        const newDate = new Date(selectedDate);
        newDate.setHours(date.getHours(), date.getMinutes());

        // Check if switching to today with current time would result in a past time
        if (min) {
          const minDate = new Date(min);
          const today = new Date();

          if (
            minDate.toDateString() === today.toDateString() &&
            selectedDate.toDateString() === today.toDateString()
          ) {
            // If switching to today, ensure the time isn't in the past
            if (newDate < today) {
              // Reset to current time if the preserved time would be in the past
              newDate.setHours(today.getHours(), today.getMinutes());
            }
          }
        }

        setDate(newDate);
      } else {
        // If no current date, just set the selected date
        setDate(selectedDate);
      }
    }
  };

  const handleTimeChange = (type: "hour" | "minute", value: string) => {
    if (date) {
      const newDate = new Date(date);
      if (type === "hour") {
        newDate.setHours(parseInt(value));
      } else if (type === "minute") {
        newDate.setMinutes(parseInt(value));
      }

      // Check if the new time would be in the past
      if (min) {
        const today = new Date();

        // Only validate against current time if the selected date is today
        if (date.toDateString() === today.toDateString()) {
          if (newDate < today) {
            return; // Don't allow selecting past time on today's date
          }
        }
        // For future dates, no time validation is needed
      }

      setDate(newDate);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"glow"}
          size={"custom"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            buttonClassName,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "MM/dd/yyyy H:mm") : <span>MM/DD/YYYY hh:mm</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="bg-gray-800/60 sm:flex">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            disabled={
              min
                ? (date) => {
                    if (!min) return false;
                    const today = new Date();
                    const minDate = new Date(min);

                    if (minDate.toDateString() === today.toDateString()) {
                      // When min date is today, disable dates before today
                      // Create dates with time set to 00:00:00 for proper comparison
                      const dateOnly = new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate(),
                      );
                      const todayOnly = new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        today.getDate(),
                      );
                      return dateOnly < todayOnly;
                    }

                    // For other dates, use the standard min date check
                    return date < minDate;
                  }
                : undefined
            }
          />
          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {hours.reverse().map((hour) => {
                  // Check if this hour would result in a past time
                  const isDisabled =
                    min &&
                    (() => {
                      const today = new Date();
                      // Only disable hours if the currently selected date is today
                      if (date && date.toDateString() === today.toDateString()) {
                        return hour < today.getHours();
                      }
                      return false;
                    })();

                  return (
                    <Button
                      key={hour}
                      size="icon"
                      variant={date && date.getHours() === hour ? "default" : "ghost"}
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() => handleTimeChange("hour", hour.toString())}
                      disabled={isDisabled}
                    >
                      {hour}
                    </Button>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => {
                  // Check if this minute would result in a past time
                  const isDisabled =
                    min &&
                    (() => {
                      const today = new Date();
                      // Only disable minutes if the currently selected date is today
                      if (date && date.toDateString() === today.toDateString()) {
                        if (date.getHours() === today.getHours()) {
                          return minute < today.getMinutes();
                        }
                      }
                      return false;
                    })();

                  return (
                    <Button
                      key={minute}
                      size="icon"
                      variant={date && date.getMinutes() === minute ? "default" : "ghost"}
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() => handleTimeChange("minute", minute.toString())}
                      disabled={isDisabled}
                    >
                      {minute.toString().padStart(2, "0")}
                    </Button>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
