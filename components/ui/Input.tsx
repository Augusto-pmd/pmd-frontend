import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-[#3A3A3C] mb-1.5">
          {label}
        </label>
      )}
      <input
        className={cn(
          "w-full px-3 py-2 text-sm bg-white/70 border-gray-300/40 rounded-xl text-[#1C1C1E] placeholder:text-[#AEAEB2] shadow-inner",
          "focus:ring-2 focus:ring-[#0A84FF]/40 focus:border-[#0A84FF]/50 outline-none apple-transition",
          error && "border-red-500/60 focus:ring-red-500/40 focus:border-red-500/60",
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
