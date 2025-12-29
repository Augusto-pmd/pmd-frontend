import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  const inputStyle: React.CSSProperties = {
    height: "42px",
    backgroundColor: "var(--apple-surface)",
    border: error ? "1px solid #FF3B30" : "1px solid var(--apple-border-strong)",
    borderRadius: "var(--radius-md)",
    padding: "0 14px",
    fontSize: "14px",
    fontFamily: "Inter, system-ui, sans-serif",
    color: "var(--apple-text-primary)",
    outline: "none",
    transition: "border-color var(--apple-duration-fast) var(--apple-ease), box-shadow var(--apple-duration-fast) var(--apple-ease), background-color var(--apple-duration-fast) var(--apple-ease)",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: 500,
    color: "var(--apple-text-secondary)",
    marginBottom: "6px",
    fontFamily: "Inter, system-ui, sans-serif",
  };

  const focusStyle = {
    border: "1px solid var(--apple-blue)",
    boxShadow: "0 0 0 3px rgba(0,122,255,0.25)",
  };

  return (
    <div className="w-full">
      {label && (
        <label style={labelStyle}>
          {label}
          {props.required && <span style={{ color: "#FF3B30", marginLeft: "4px" }}>*</span>}
        </label>
      )}
      <input
        className={cn(className)}
        style={inputStyle}
        placeholder={props.placeholder || ""}
        onFocus={(e) => {
          if (!error) {
            Object.assign(e.currentTarget.style, { ...inputStyle, ...focusStyle });
          }
        }}
        onBlur={(e) => {
          Object.assign(e.currentTarget.style, inputStyle);
        }}
        {...props}
      />
      {error && (
        <p style={{ marginTop: "6px", fontSize: "13px", color: "#FF3B30" }}>
          {error}
        </p>
      )}
    </div>
  );
}
