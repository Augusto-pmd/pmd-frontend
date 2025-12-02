import { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import styles from "./form.module.css";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export function Textarea({ error, className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(styles.textarea, error && styles.inputError, className)}
      {...props}
    />
  );
}

