// src/components/dashboard/MetricCard.tsx

'use client';

import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  label: string;
  value: React.ReactNode; // ✅ Разрешаем JSX, строки, числа и т.д.
  icon: React.ReactNode;  // ✅ Вот здесь — ключевое изменение!
}

export default function MetricCard({ label, value, icon }: MetricCardProps) {
  return (
    <Card className="bg-card border border-border/50 hover:border-primary/30 transition-colors">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-muted-foreground">
            {icon}
          </div>
          <div className="text-xs font-medium text-muted-foreground">{label}</div>
        </div>
        <div className="text-lg sm:text-xl font-bold text-foreground">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}