"use client";

import { AuditEntry } from "./AuditEntry";
import { EmptyState } from "@/components/ui/EmptyState";

interface AuditLog {
  id: string;
  [key: string]: any;
}

interface AuditListProps {
  logs: AuditLog[];
}

export function AuditList({ logs }: AuditListProps) {
  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-pmd p-12">
        <EmptyState
          icon="📋"
          title="No hay registros de auditoría"
          description="Los registros de auditoría aparecerán aquí cuando haya actividad en el sistema."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <AuditEntry key={log.id} entry={log} />
      ))}
    </div>
  );
}

