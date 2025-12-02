import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  depth?: 1 | 2 | 3;
}

export function Card({ children, className, depth = 2 }: CardProps) {
  const depthClasses = {
    1: "bg-white",
    2: "bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)]",
    3: "bg-white/70 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.12)]",
  };

  return (
    <div className={cn("border border-white/20 rounded-2xl p-6 apple-transition", depthClasses[depth], className)}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("px-6 py-4 border-b border-gray-200/30", className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn("text-base font-semibold text-gray-800", className)}>
      {children}
    </h3>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn("p-6", className)}>
      {children}
    </div>
  );
}
