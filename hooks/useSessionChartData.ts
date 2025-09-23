// src/hooks/useSessionChartData.ts
'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/services/apiService';
import { ChartDataPoint } from '@/types/session';
import { generateProgramProfile } from '@/utils/programProfileGenerator';
import { formatTimeFromStart, minutesToTimeString } from '@/utils/timeUtils'; // ✅ Импорт

const isValidTemperature = (temp: number): boolean =>
  typeof temp === 'number' &&
  !isNaN(temp) &&
  temp >= 0 &&
  temp <= 1300;

export const useSessionChartData = (sessionId: string | null, isRunning: boolean, startTime: string | null) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [profileData, setProfileData] = useState<ChartDataPoint[]>([]);
  const [runtimeData, setRuntimeData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_POINTS = 80;

  const loadProgramData = async (id: number) => {
    try {
      const programData = await ApiService.getProgramDataForSession(id.toString());
      if (programData.steps && programData.steps.length > 0) {
        const initialTemp = runtimeData.length > 0 ? runtimeData[0].temperature : 0;
        const profile = generateProgramProfile(programData, initialTemp);
        setProfileData(profile);
      }
    } catch (e) {
      console.error("Ошибка загрузки программы:", e);
      setError(e instanceof Error ? e.message : 'Ошибка загрузки профиля');
    }
  };

  const loadRuntimeData = async (id: number) => {
    try {
      const readings = await ApiService.getSessionTemperatureReadings(id.toString());
      if (!startTime) {
        console.warn("startTime не передан, реальные данные не будут синхронизированы");
        return;
      }

      const sessionStart = new Date(startTime).getTime();
      const newData: ChartDataPoint[] = readings
        .map((reading: any) => {
          const readingTime = new Date(reading.timestamp).getTime();
          const elapsedMinutes = Math.floor((readingTime - sessionStart) / 60000);
          let temp = reading.temperature;
          if (!isValidTemperature(temp)) {
            temp = undefined;
          }
          return {
            time: minutesToTimeString(elapsedMinutes), // ✅ Это уже отсчитывается от начала
            temperature: temp,
          };
        })
        .filter((p: ChartDataPoint) => p.temperature !== undefined);

      setRuntimeData(newData);
    } catch (e) {
      console.error("Ошибка загрузки данных температуры:", e);
      setError(e instanceof Error ? e.message : 'Ошибка загрузки температуры');
    }
  };

  useEffect(() => {
    if (!sessionId) {
      setChartData([]);
      setProfileData([]);
      setRuntimeData([]);
      return;
    }

    const id = parseInt(sessionId, 10);
    if (isNaN(id)) return;

    setIsLoading(true);
    setError(null);

    Promise.all([
      loadProgramData(id),
      loadRuntimeData(id)
    ]).finally(() => {
      setIsLoading(false);
    });

    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => loadRuntimeData(id), 60000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionId, isRunning, startTime]);

  // Объединение данных — теперь используем правильные временные метки
  useEffect(() => {
    if (profileData.length === 0 && runtimeData.length === 0) {
      setChartData([]);
      return;
    }

    const mergedDataMap = new Map<string, ChartDataPoint>();

    // Добавляем профиль
    profileData.forEach(p => {
      mergedDataMap.set(p.time, { ...p });
    });

    // Добавляем реальные данные
    runtimeData.forEach(p => {
      const existing = mergedDataMap.get(p.time);
      if (existing) {
        mergedDataMap.set(p.time, { ...existing, temperature: p.temperature });
      } else {
        mergedDataMap.set(p.time, { time: p.time, temperature: p.temperature, targetTemp: undefined });
      }
    });

    // Сортировка по времени
    const sorted = Array.from(mergedDataMap.values()).sort((a, b) => {
      const [h1, m1] = a.time.split(':').map(Number);
      const [h2, m2] = b.time.split(':').map(Number);
      return (h1 * 60 + m1) - (h2 * 60 + m2);
    });

    const limited = sorted.slice(-MAX_POINTS);
    setChartData(limited);
  }, [profileData, runtimeData]);

  return { chartData, isLoading, error };
};