"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdCalendarToday } from "react-icons/md";
import { cn } from "../lib/utils";

export function DateInput({ value, onChange, className, placeholder = "YYYY-MM-DD" }) {
  const [isFocused, setIsFocused] = useState(false);

  // Convert string value to Date object
  const dateValue = value ? new Date(value) : null;

  const handleChange = (date) => {
    if (date) {
      // Format date as YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      onChange(`${year}-${month}-${day}`);
    } else {
      onChange('');
    }
  };

  return (
    <div className={cn("relative", className)}>
      <DatePicker
        selected={dateValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        dateFormat="yyyy-MM-dd"
        placeholderText={placeholder}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm",
          "focus:border-primary focus:shadow-none focus:ring-0 focus:ring-offset-0 outline-none",
          "transition-all duration-200",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
        showYearDropdown
        showMonthDropdown
        dropdownMode="select"
      />
      <MdCalendarToday
        className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none",
          "transition-colors duration-200",
          isFocused ? "text-primary-500" : "text-gray-400"
        )}
      />
    </div>
  );
}

export function TimeInput({ value, onChange, className, placeholder = "HH:MM" }) {
  const [isFocused, setIsFocused] = useState(false);

  // Convert HH:MM string to Date object
  const timeValue = value ? (() => {
    const [hours, minutes] = value.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10) || 0);
    date.setMinutes(parseInt(minutes, 10) || 0);
    return date;
  })() : null;

  const handleChange = (time) => {
    if (time) {
      const hours = String(time.getHours()).padStart(2, '0');
      const minutes = String(time.getMinutes()).padStart(2, '0');
      onChange(`${hours}:${minutes}`);
    } else {
      onChange('');
    }
  };

  return (
    <div className={cn("relative", className)}>
      <DatePicker
        selected={timeValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={15}
        timeCaption="Time"
        dateFormat="HH:mm"
        timeFormat="HH:mm"
        placeholderText={placeholder}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          "focus:border-primary focus:shadow-none focus:ring-0 focus:ring-offset-0 outline-none",
          "transition-all duration-200",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      />
    </div>
  );
}
