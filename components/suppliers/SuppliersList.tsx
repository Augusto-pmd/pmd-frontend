"use client";

import { SupplierCard } from "./SupplierCard";

interface Supplier {
  id: string;
  [key: string]: any;
}

interface SuppliersListProps {
  suppliers: Supplier[];
  onRefresh?: () => void;
}

export function SuppliersList({ suppliers, onRefresh }: SuppliersListProps) {
  if (suppliers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-pmd p-12 text-center">
        <p className="text-gray-600 text-lg">No hay proveedores registrados</p>
        <p className="text-gray-500 text-sm mt-2">
          Haz clic en &quot;Nuevo Proveedor&quot; para agregar uno
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {suppliers.map((supplier) => (
        <SupplierCard key={supplier.id} supplier={supplier} onRefresh={onRefresh} />
      ))}
    </div>
  );
}

