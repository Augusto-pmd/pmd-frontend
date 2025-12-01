"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
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
        "cursor-pointer transition-all duration-200 hover:scale-105",
        className
      )}
    >
      <Card className="border-l-4 border-pmd-gold hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl flex-shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-pmd-darkBlue mb-2">{title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

