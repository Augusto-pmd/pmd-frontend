"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BackupList } from "@/components/backups/BackupList";
import { BackupConfig } from "@/components/backups/BackupConfig";
import { BackupLogs } from "@/components/backups/BackupLogs";
import { BackupStatus } from "@/components/backups/BackupStatus";
import { BotonVolver } from "@/components/ui/BotonVolver";

function BackupsContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Backups</h1>
          <p className="text-gray-600 mt-1">
            Crea, descarga y gestiona los backups de la base de datos
          </p>
        </div>
        <BotonVolver />
      </div>

      {/* Estado y Configuración */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BackupStatus />
        </div>
        <div>
          <BackupConfig />
        </div>
      </div>

      {/* Lista de Backups */}
      <BackupList />

      {/* Logs de Backups */}
      <BackupLogs />
    </div>
  );
}

export default function BackupsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-6">
        <BackupsContent />
      </div>
    </ProtectedRoute>
  );
}

