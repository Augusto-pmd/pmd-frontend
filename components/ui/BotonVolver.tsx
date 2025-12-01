"use client";

import { useRouter } from "next/navigation";

export function BotonVolver() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="text-pmd-darkBlue hover:text-pmd-mediumBlue font-medium mb-4 transition-colors hover:underline"
    >
      ← Volver
    </button>
  );
}

