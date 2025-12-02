"use client";

import { EmployeeCard } from "./EmployeeCard";
import { EmptyState } from "@/components/ui/EmptyState";

interface Employee {
  id: string;
  [key: string]: any;
}

interface EmployeesListProps {
  employees: Employee[];
}

export function EmployeesList({ employees }: EmployeesListProps) {
  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-pmd p-12">
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
        <EmployeeCard key={employee.id} employee={employee} />
      ))}
    </div>
  );
}

