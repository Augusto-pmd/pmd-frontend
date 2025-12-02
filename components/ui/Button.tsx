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
    "font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:ring-offset-1 apple-transition";

  const variants = {
    primary: "bg-blue-600/80 text-white backdrop-blur-xl hover:bg-blue-600 shadow-[0_0_10px_rgba(0,0,0,0.08)]",
    secondary: "bg-white/40 backdrop-blur-xl border border-white/30 text-gray-700 hover:bg-white/60",
    outline: "border border-gray-300/50 text-gray-700 hover:bg-white/50 backdrop-blur-sm",
    ghost: "text-blue-600 hover:bg-white/40 backdrop-blur-sm",
    icon: "bg-white/50 backdrop-blur-xl rounded-xl p-2 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:bg-white/70",
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
