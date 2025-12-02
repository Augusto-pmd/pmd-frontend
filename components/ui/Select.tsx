import { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import styles from "./form.module.css";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export function Select({ error, className, ...props }: SelectProps) {
  return (
    <select
      className={cn(styles.select, error && styles.inputError, className)}
      {...props}
    />
  );
}

