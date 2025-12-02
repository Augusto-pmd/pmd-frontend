import { ReactNode } from "react";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#F5F5F7] flex items-center justify-center p-4">
      {children}
    </div>
  );
}

