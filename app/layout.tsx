import type { Metadata } from "next";
import "./globals.css";
import { SWRProvider } from "@/components/providers/SWRProvider";
import { DebugErrorBoundary } from "@/components/DebugErrorBoundary";

export const metadata: Metadata = {
  title: "PMD Management System",
  description: "Premium Management Dashboard for PMD",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <DebugErrorBoundary>
          <SWRProvider>{children}</SWRProvider>
        </DebugErrorBoundary>
      </body>
    </html>
  );
}

