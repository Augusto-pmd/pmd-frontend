import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-white/30 text-[#3A3A3C]",
    success: "bg-emerald-50/80 text-emerald-800 backdrop-blur-sm",
    warning: "bg-yellow-50/80 text-yellow-800 backdrop-blur-sm",
    error: "bg-red-50/80 text-red-700 backdrop-blur-sm",
    info: "bg-[#0A84FF]/20 text-[#0A84FF] backdrop-blur-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
