import { ReactNode } from "react";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pmd-darkBlue via-pmd-mediumBlue to-pmd-darkBlue flex items-center justify-center">
      {children}
    </div>
  );
}

