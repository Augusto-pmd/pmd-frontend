"use client";

// Este layout no debe redefinir html/body
// Solo devuelve children y permite que RootLayout se use correctamente

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

