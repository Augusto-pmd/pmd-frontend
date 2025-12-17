import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "icon";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  loading?: boolean; // Muestra spinner y deshabilita botón
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
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

  const getHoverStyles = (variant: string) => {
    if (variant === "primary") {
      return {
        backgroundColor: "var(--pmd-accent-light)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      };
    }
    if (variant === "danger") {
      return {
        backgroundColor: "rgba(255, 59, 48, 0.1)",
        boxShadow: "0 2px 8px rgba(255, 59, 48, 0.2)",
      };
    }
    return {
      backgroundColor: "var(--apple-button-hover)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    };
  };

  const activeStyles = {
    backgroundColor: "var(--apple-button-active)",
    transform: "scale(0.985)",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      ...baseStyles,
      borderColor: "var(--pmd-accent)",
      color: "var(--pmd-accent)",
    },
    secondary: baseStyles,
    outline: baseStyles,
    danger: {
      ...baseStyles,
      borderColor: "#FF3B30",
      color: "#FF3B30",
      backgroundColor: "transparent",
    },
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
      height: "48px", // Aumentado de 36px a 48px para mobile
    },
    md: {
      padding: "0 var(--space-md)",
      fontSize: "14px",
      height: "48px", // Aumentado de 44px a 48px para mobile
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
    ...(isDisabled && { opacity: 0.5, cursor: "not-allowed" }),
  };

  return (
    <button
      className={cn(className)}
      style={combinedStyle}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          Object.assign(e.currentTarget.style, getHoverStyles(variant));
        }
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, combinedStyle);
      }}
      onMouseDown={(e) => {
        if (!isDisabled) {
          Object.assign(e.currentTarget.style, activeStyles);
        }
      }}
      onMouseUp={(e) => {
        if (!isDisabled) {
          Object.assign(e.currentTarget.style, getHoverStyles(variant));
        }
      }}
      onFocus={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,122,255,0.25)";
        }
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = combinedStyle.boxShadow || "none";
      }}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span>{typeof children === "string" && children.includes("Guardar") ? "Guardando..." : "Procesando..."}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;
