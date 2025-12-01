"use client";

import "./globals.css";
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
          {children}
        </DebugErrorBoundary>
      </body>
    </html>
  );
}

