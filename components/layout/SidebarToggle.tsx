"use client";

import { Menu, X } from "lucide-react";

interface SidebarToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function SidebarToggle({ isOpen, onToggle }: SidebarToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="p-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all active:scale-95 touch-none select-none"
      aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
    >
      {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
    </button>
  );
}

