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
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={cn(
          "w-full px-3 py-2 text-sm bg-white/70 backdrop-blur-md border border-gray-300/50 rounded-xl text-gray-900 placeholder:text-gray-500 shadow-inner",
          "focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600/50 outline-none transition",
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
