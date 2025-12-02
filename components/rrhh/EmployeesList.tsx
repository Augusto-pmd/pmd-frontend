"use client";

import { EmployeeCard } from "./EmployeeCard";
import { EmptyState } from "@/components/ui/EmptyState";

interface Employee {
  id: string;
  [key: string]: any;
}

interface EmployeesListProps {
  employees: Employee[];
  onRefresh?: () => void;
}

export function EmployeesList({ employees, onRefresh }: EmployeesListProps) {
  if (employees.length === 0) {
    return (
      <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-12">
        <EmptyState
          icon="👥"
          title="No hay empleados registrados"
          description="Los empleados y obreros aparecerán aquí cuando se registren en el sistema."
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {employees.map((employee) => (
        <EmployeeCard key={employee.id} employee={employee} onRefresh={onRefresh} />
      ))}
    </div>
  );
}

