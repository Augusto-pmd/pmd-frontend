"use client";

import "./globals.css";
import { SWRProvider } from "@/components/providers/SWRProvider";
import { DebugErrorBoundary } from "@/components/DebugErrorBoundary";

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

