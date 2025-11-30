"use client";

import { SWRConfig } from "swr";
import { swrConfig } from "@/lib/swr-config";
import { useEffect } from "react";

export function SWRProvider({ children }: { children: React.ReactNode }) {
  // Limpieza de seguridad al inicializar la app
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cache = localStorage.getItem("pmd-auth-storage");
      if (cache) {
        try {
          const parsed = JSON.parse(cache);
          if (typeof parsed.state?.user?.role === "object") {
            parsed.state.user.role = parsed.state.user.role.name;
            localStorage.setItem("pmd-auth-storage", JSON.stringify(parsed));
          }
        } catch {}
      }
    }
  }, []);

  return <SWRConfig value={swrConfig}>{children}</SWRConfig>;
}

