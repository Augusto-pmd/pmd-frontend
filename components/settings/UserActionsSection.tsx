"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function UserActionsSection() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleEditProfile = () => {
    // Placeholder por ahora
    alert("Funcionalidad de edición de perfil próximamente disponible");
  };

  const handleChangePassword = () => {
    // Placeholder por ahora
    alert("Funcionalidad de cambio de contraseña próximamente disponible");
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Opciones de Cuenta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={handleEditProfile}
        >
          Editar perfil
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={handleChangePassword}
        >
          Cambiar contraseña
        </Button>

        <div className="pt-4 border-t border-gray-200">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleLogout}
          >
            Cerrar sesión
          </Button>
        </div>

        <Button
          variant="ghost"
          size="lg"
          className="w-full"
          onClick={handleBackToDashboard}
        >
          Volver al Dashboard
        </Button>
      </CardContent>
    </Card>
  );
}

