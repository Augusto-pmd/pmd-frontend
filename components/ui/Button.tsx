import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "icon";
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
    "font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#0A84FF]/40 focus:ring-offset-1 apple-transition";

  const variants = {
    primary: "bg-gradient-to-r from-[#162F7F] to-[#0A84FF] text-white backdrop-blur-xl shadow-[0_4px_20px_rgba(22,47,127,0.25)] hover:opacity-90",
    secondary: "bg-white/30 border border-white/20 rounded-xl text-[#3A3A3C] backdrop-blur-xl hover:bg-white/40",
    outline: "border border-gray-300/40 text-[#3A3A3C] hover:bg-white/30 backdrop-blur-sm",
    ghost: "text-[#0A84FF] hover:bg-white/30 backdrop-blur-sm",
    icon: "bg-white/30 backdrop-blur-xl rounded-xl p-2 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:bg-white/40",
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
