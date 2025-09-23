// src/hooks/useFiringChartData.ts
'use client';

import { useState, useEffect } from 'react';
import { FiringSession, ChartDataPoint } from '@/types/session';
import { generateProgramProfile } from '@/utils/programProfileGenerator';
import { formatTimeFromStart } from '@/utils/timeUtils';

export const useFiringChartData = (firing: FiringSession | null) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    if (!firing) {
      setChartData([]);
      return;
    }

    const startTime = firing.start_time;

    // Реальные данные
    const realData: ChartDataPoint[] = firing.temperature_readings?.map(r => ({
      time: formatTimeFromStart(r.timestamp, startTime),
      temperature: typeof r.temperature === 'number' && !isNaN(r.temperature)
        ? r.temperature
        : undefined,
      targetTemp: undefined,
    })) || [];

    // Профиль
    let profileData: ChartDataPoint[] = [];
    if (firing.program) {
      profileData = generateProgramProfile(firing.program);
    }

    // Объединяем данные
    const merged = mergeChartData(realData, profileData);
    setChartData(merged);
  }, [firing]);

  return chartData;
};

// ✅ Вынесенная функция объединения — локальная для хука
const mergeChartData = (realData: ChartDataPoint[], profileData: ChartDataPoint[]) => {
  const timeMap = new Map<string, ChartDataPoint>();

  // Добавляем все точки профиля
  profileData.forEach(point => {
    timeMap.set(point.time, { ...point });
  });

  // Добавляем реальные данные, объединяя по времени
  realData.forEach(point => {
    const existing = timeMap.get(point.time);
    if (existing) {
      // Если точка с таким временем уже есть — добавляем температуру
      timeMap.set(point.time, { ...existing, temperature: point.temperature });
    } else {
      // Если нет — создаём новую точку только с температурой
      timeMap.set(point.time, {
        time: point.time,
        temperature: point.temperature,
        targetTemp: undefined,
      });
    }
  });

  // Сортируем по времени
  const sorted = Array.from(timeMap.values()).sort((a, b) => {
    const [aH, aM] = a.time.split(':').map(Number);
    const [bH, bM] = b.time.split(':').map(Number);
    return aH * 60 + aM - (bH * 60 + bM);
  });

  return sorted;
};