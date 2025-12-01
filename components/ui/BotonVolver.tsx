"use client";

import { useRouter } from "next/navigation";

export function BotonVolver() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="cursor-pointer text-sm font-medium hover:text-blue-600 mb-4 transition-colors hover:underline"
    >
      ← Volver
    </button>
  );
}

