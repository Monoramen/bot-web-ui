// src/components/dashboard/HeaderStatusCard.tsx
'use client';

import { Card, CardContent } from "@/components/ui/card";
import StatusIndicator from '@/components/StatusIndicator';
import MetricCard from '@/components/dashboard/MetricCard';
import { useTemperature } from '@/hooks/useTemperature';
import { FiringProgram } from "@/types/session";
import { useRemainingTime } from '@/hooks/useRemainingTime';
import { ListOrdered,Thermometer, TimerIcon } from "lucide-react";
import { usePower } from '@/hooks/usePower';
import { Zap } from "lucide-react"; // ⚡️ иконка мощности
// ✅ Форматирование времени в MM:SS
const formatTime = (minutes: number): string => {
  if (minutes < 0) minutes = 0;
  const totalSeconds = Math.round(minutes * 60);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};


interface HeaderStatusCardProps {
  deviceStatus: string;
  isRunning: boolean;
  isCritical: boolean;
  statusMap: Record<string, string>;
  currentStage: string;
  program?: FiringProgram;
  startTime?: string;
}

export default function HeaderStatusCard({
  deviceStatus,
  isRunning,
  isCritical,
  statusMap,
  currentStage,
  program,
  startTime,
}: HeaderStatusCardProps) {
  const { currentTemp, loading: tempLoading } = useTemperature();

  const { remainingMinutes, currentStepInfo } = useRemainingTime(program, startTime);
  const { power, loading: powerLoading } = usePower();
  // ✅ Формируем текст для "Этап"
  const stageLabel = () => {
    if (!isRunning) return "—";
    if (!program || !currentStepInfo) return "Загрузка...";
    if (remainingMinutes <= 0) return "Готово";
    return `Шаг ${currentStepInfo.index}`;
  };

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
            icon= {<Thermometer/>}
          />
          <MetricCard
            label="Мощность"
            value={
              powerLoading ? (
                <span className="inline-block animate-pulse">...</span>
              ) : power !== null ? (
                <span className="font-bold">{power}</span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )
            }
            icon={<Zap className="text-yellow-500" />}
          />
          {/* ✅ ЭТАП — теперь с иконкой и правильным текстом */}
          <MetricCard
            label="Этап"
            value={
              !isRunning
                ? <span className="text-muted-foreground">—</span>
                : !program || !startTime
                  ? <span className="inline-block animate-pulse">Загрузка...</span>
                  : currentStepInfo && remainingMinutes > 0
                    ? <span className="font-medium">{stageLabel()}</span>
                    : <span className="font-medium text-green-500">Готово</span>
            }
            icon={<ListOrdered />}
          />

          {/* ✅ Осталось — только MM:SS, чисто и красиво */}
          <MetricCard
            label="Осталось"
            value={
              !isRunning
                ? <span className="text-muted-foreground">—</span>
                : !program || !startTime
                  ? <span className="inline-block animate-pulse">Загрузка...</span>
                  : (
                    <span className={`font-mono font-bold ${remainingMinutes < 1 ? 'text-red-500' : ''}`}>
                      {formatTime(remainingMinutes)}
                    </span>
                  )
            }
            icon= {<TimerIcon/>}
          />
        </div>
      </CardContent>
    </Card>
  );
}