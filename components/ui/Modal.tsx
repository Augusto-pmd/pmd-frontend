"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm apple-transition"
      onClick={onClose}
    >
      <div
        className={cn(
          "bg-white/40 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl w-full mx-4 max-h-[90vh] overflow-y-auto apple-transition",
          sizes[size]
        )}
        onClick={(e) => e.stopPropagation()}
        style={{ 
          mixBlendMode: 'luminosity',
        }}
      >
        <div className="sticky top-0 bg-white/30 backdrop-blur-md border-b border-white/20 px-6 py-4 flex justify-between items-center rounded-t-3xl">
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-white/40 text-xl leading-none w-7 h-7 flex items-center justify-center rounded-xl apple-transition backdrop-blur-sm"
          >
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
