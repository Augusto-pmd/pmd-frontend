"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: string;
  route: string;
  className?: string;
}

export function ModuleCard({ title, description, icon, route, className }: ModuleCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(route);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "cursor-pointer rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-5 hover:bg-white/15 transition-all",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="text-2xl flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 mb-1.5">
            {title}
          </h3>
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
