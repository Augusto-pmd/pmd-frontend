"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { UserProfileCard } from "@/components/settings/UserProfileCard";
import { SettingsActions } from "@/components/settings/SettingsActions";
import { BotonVolver } from "@/components/ui/BotonVolver";

function SettingsContent() {
  const user = useAuthStore((state) => state.getUserSafe());

  return (
    <MainLayout>
      <div className="space-y-6 py-6">
        <div className="px-1">
          <BotonVolver />
        </div>

        <div className="px-1">
          <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Configuración</h1>
          <p className="text-gray-600">Preferencias y datos del usuario</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Perfil del usuario */}
          <div className="lg:col-span-2">
            <UserProfileCard user={user} />
          </div>

          {/* Acciones */}
          <div>
            <SettingsActions />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}

