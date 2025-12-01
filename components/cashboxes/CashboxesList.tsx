"use client";

import { CashboxCard } from "./CashboxCard";
import { EmptyState } from "@/components/ui/EmptyState";

interface Cashbox {
  id: string;
  [key: string]: any;
}

interface CashboxesListProps {
  cashboxes: Cashbox[];
}

export function CashboxesList({ cashboxes }: CashboxesListProps) {
  if (cashboxes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-pmd p-12 text-center">
        <p className="text-gray-600 text-lg">No hay cajas registradas</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cashboxes.map((cashbox) => (
        <CashboxCard key={cashbox.id} cashbox={cashbox} />
      ))}
    </div>
  );
}

