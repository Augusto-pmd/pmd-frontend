"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { useEffect } from "react";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    console.log("[AUTH LAYOUT] mounted");
  }, []);

  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}

