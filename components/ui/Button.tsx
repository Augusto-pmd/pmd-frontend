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
  const baseStyles = {
    fontFamily: "Inter, system-ui, sans-serif",
    fontWeight: 500,
    borderRadius: "var(--radius-lg)",
    height: "44px",
    border: "1px solid rgba(0,0,0,0.15)",
    backgroundColor: "var(--apple-surface)",
    color: "var(--apple-text-primary)",
    transition: "background-color var(--apple-duration-fast) var(--apple-ease), border-color var(--apple-duration-fast) var(--apple-ease), box-shadow var(--apple-duration-fast) var(--apple-ease), transform var(--apple-duration-fast) var(--apple-ease)",
    outline: "none",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "none",
  };

  const hoverStyles = {
    backgroundColor: "var(--apple-button-hover)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  };

  const activeStyles = {
    backgroundColor: "var(--apple-button-active)",
    transform: "scale(0.985)",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: baseStyles,
    secondary: baseStyles,
    outline: baseStyles,
    ghost: {
      ...baseStyles,
      border: "none",
      backgroundColor: "transparent",
      color: "var(--apple-blue)",
    },
    icon: {
      ...baseStyles,
      width: "44px",
      height: "44px",
      padding: 0,
      border: "1px solid var(--apple-border)",
    },
  };

  const sizes: Record<string, React.CSSProperties> = {
    sm: {
      padding: "0 var(--space-sm)",
      fontSize: "13px",
      height: "36px",
    },
    md: {
      padding: "0 var(--space-md)",
      fontSize: "14px",
      height: "44px",
    },
    lg: {
      padding: "0 var(--space-lg)",
      fontSize: "15px",
      height: "48px",
    },
  };

  const combinedStyle = {
    ...variants[variant],
    ...sizes[size],
    ...(props.disabled && { opacity: 0.5, cursor: "not-allowed" }),
  };

  return (
    <button
      className={cn(className)}
      style={combinedStyle}
      onMouseEnter={(e) => {
        if (!props.disabled) {
          Object.assign(e.currentTarget.style, hoverStyles);
        }
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, combinedStyle);
      }}
      onMouseDown={(e) => {
        if (!props.disabled) {
          Object.assign(e.currentTarget.style, activeStyles);
        }
      }}
      onMouseUp={(e) => {
        if (!props.disabled) {
          Object.assign(e.currentTarget.style, hoverStyles);
        }
      }}
      onFocus={(e) => {
        if (!props.disabled) {
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,122,255,0.25)";
        }
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = combinedStyle.boxShadow || "none";
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
