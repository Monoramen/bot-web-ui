// src/components/dashboard/HeaderStatusCard.tsx

'use client';

import { Card, CardContent } from "@/components/ui/card";
import StatusIndicator from '@/components/StatusIndicator';
import MetricCard from '@/components/dashboard/MetricCard';
import { useTemperature } from '@/hooks/useTemperature';

interface HeaderStatusCardProps {
  deviceStatus: string;
  isRunning: boolean;
  isCritical: boolean;
  statusMap: Record<string, string>;
  currentStage: string;
  remainingTime: string;
}

export default function HeaderStatusCard({
  deviceStatus,
  isRunning,
  isCritical,
  statusMap,
  currentStage,
  remainingTime,
}: HeaderStatusCardProps) {
  const { currentTemp, loading: tempLoading } = useTemperature();

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3 border-2 border-primary/20 shadow-lg">
      <CardContent className="pt-0 pb-0 px-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Система обжига Печи
            </h1>
            <p className="text-base text-muted-foreground mt-1">
              Управление и мониторинг в реальном времени
            </p>
          </div>

          <StatusIndicator
            isRunning={isRunning}
            isCritical={isCritical}
            statusText={statusMap[deviceStatus] || deviceStatus}
          />
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
          <MetricCard
            label="Температура"
            value={tempLoading ? <span className="inline-block animate-pulse">...</span> : `${currentTemp}°C`}
            icon="🔥"
          />
          <MetricCard
            label="Этап"
            value={currentStage}
            icon="📊"
          />
          <MetricCard
            label="Осталось"
            value={remainingTime}
            icon="⏱️"
          />
        </div>
      </CardContent>
    </Card>
  );
}