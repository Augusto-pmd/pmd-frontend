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
  style,
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
      width: "auto",
      minWidth: "32px",
      height: "32px",
      padding: "6px",
      border: "1px solid var(--apple-border)",
      backgroundColor: "transparent",
    },
  };

  const sizes: Record<string, React.CSSProperties> = {
    sm: {
      padding: variant === "icon" ? "6px" : "0 var(--space-sm)",
      fontSize: "13px",
      height: variant === "icon" ? "32px" : "48px", // Aumentado de 36px a 48px para mobile
      minWidth: variant === "icon" ? "32px" : "auto",
    },
    md: {
      padding: variant === "icon" ? "8px" : "0 var(--space-md)",
      fontSize: "14px",
      height: variant === "icon" ? "36px" : "48px", // Aumentado de 44px a 48px para mobile
      minWidth: variant === "icon" ? "36px" : "auto",
    },
    lg: {
      padding: variant === "icon" ? "10px" : "0 var(--space-lg)",
      fontSize: "15px",
      height: variant === "icon" ? "40px" : "48px",
      minWidth: variant === "icon" ? "40px" : "auto",
    },
  };

  const combinedStyle = {
    ...variants[variant],
    ...sizes[size],
    ...(isDisabled && { opacity: 0.5, cursor: "not-allowed" }),
  };

  // Guardar estilos inline personalizados si existen
  const customStyle = style || {};

  return (
    <button
      className={cn(className)}
      style={{ ...combinedStyle, ...customStyle }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          const hoverStyles = getHoverStyles(variant);
          // Preservar estilos inline personalizados (especialmente color)
          Object.assign(e.currentTarget.style, {
            ...hoverStyles,
            ...(customStyle.color && { color: customStyle.color }),
          });
        }
      }}
      onMouseLeave={(e) => {
        // Restaurar estilos originales incluyendo los personalizados
        Object.assign(e.currentTarget.style, { ...combinedStyle, ...customStyle });
      }}
      onMouseDown={(e) => {
        if (!isDisabled) {
          // Preservar color personalizado durante el click
          Object.assign(e.currentTarget.style, {
            ...activeStyles,
            ...(customStyle.color && { color: customStyle.color }),
          });
        }
      }}
      onMouseUp={(e) => {
        if (!isDisabled) {
          const hoverStyles = getHoverStyles(variant);
          // Preservar color personalizado
          Object.assign(e.currentTarget.style, {
            ...hoverStyles,
            ...(customStyle.color && { color: customStyle.color }),
          });
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
