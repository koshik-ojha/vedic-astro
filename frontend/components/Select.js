"use client";

import { useState, useRef, useEffect } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { cn } from "../lib/utils";

export function Select({ value, onChange, options, placeholder = "Select...", className }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={selectRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-left items-center justify-between",
          "focus:border-primary focus:shadow-none focus:ring-0 focus:ring-offset-0 outline-none",
          "transition-all duration-200",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        <span className={cn(
          "capitalize",
          !selectedOption && "text-gray-400"
        )}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <MdKeyboardArrowDown
          className={cn(
            "w-5 h-5 text-gray-500 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className={cn(
          "absolute z-50 w-full mt-2 py-2 rounded-md border border-input",
          "bg-background shadow-lg max-h-60 overflow-auto",
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "w-full px-4 py-2.5 text-left capitalize transition-colors",
                "hover:bg-primary-50 hover:text-primary-700",
                value === option.value && "bg-primary-50 text-primary-700 font-medium"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
