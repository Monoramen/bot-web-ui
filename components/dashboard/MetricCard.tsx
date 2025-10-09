// src/components/dashboard/MetricCard.tsx

'use client';

import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  showLabel?: boolean; // Новый проп для управления видимостью метки
}

export default function MetricCard({ label, value, icon, showLabel = true }: MetricCardProps) {
  return (
    <Card className="        bg-card-light
        border border-border/50
        hover:border-primary/30
        transition-all
        duration-300
        hover:scale-105
        cursor-pointer
        will-change-transform">
      <CardContent className="p-3 sm:p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="text-muted-foreground">
            {icon}
          </div>
          {/* Условно отображаем метку только если showLabel === true */}
          {showLabel && <div className="text-2xl font-medium text-muted-foreground">{label}</div>}
        </div>
        <div className="text-xl sm:text-xl md:text-2xl font-extrabold text-foreground leading-none">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}