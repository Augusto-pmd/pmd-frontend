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
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={cn(
          "w-full px-4 py-2 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-gray-900 placeholder:text-gray-500",
          "focus:ring-[#162F7F]/40 focus:border-[#162F7F]/40 outline-none transition-all",
          error && "border-red-500/60 focus:ring-red-500/40 focus:border-red-500/60",
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

