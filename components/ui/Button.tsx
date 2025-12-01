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
    "font-semibold rounded-pmd transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pmd-gold";

  const variants = {
    primary: "bg-pmd-darkBlue text-pmd-white hover:bg-pmd-mediumBlue",
    secondary: "bg-pmd-gold text-pmd-darkBlue hover:bg-yellow-500",
    outline:
      "border-2 border-pmd-darkBlue text-pmd-darkBlue hover:bg-pmd-darkBlue hover:text-pmd-white",
    ghost: "text-pmd-darkBlue hover:bg-gray-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

export default Button;
