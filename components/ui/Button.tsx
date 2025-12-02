import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#162F7F]/40 focus:ring-offset-2";

  const variants = {
    primary: "bg-[#162F7F]/70 backdrop-blur-md border border-white/20 text-white shadow-[0_0_15px_rgba(22,47,127,0.4)] hover:bg-[#162F7F]/80",
    secondary: "bg-white/10 border border-white/30 text-gray-200 hover:bg-white/20 backdrop-blur-sm",
    outline: "border border-white/30 text-gray-700 hover:bg-white/10 backdrop-blur-sm",
    ghost: "text-[#162F7F] hover:opacity-70",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-2.5 text-sm",
  };

  return (
    <button className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

export default Button;
