'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/services/apiService';
import { ChartDataPoint } from '@/types/session';
import { generateProgramProfile } from '@/utils/programProfileGenerator';

const isValidTemperature = (temp: number): boolean =>
  typeof temp === 'number' &&
  !isNaN(temp) &&
  temp >= 0 &&
  temp <= 1300;

const minutesToTimeString = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const useSessionChartData = (sessionId: string | null, isRunning: boolean, startTime: string | null) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]); //объединенные данные для графика
  const [profileData, setProfileData] = useState<ChartDataPoint[]>([]); //данные профиля программы обжига
  const [runtimeData, setRuntimeData] = useState<ChartDataPoint[]>([]); //данные реальной температуры
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_POINTS = 80;

// В useSessionChartData.js
const loadProgramData = async (id: number) => {
 try {
 const programData = await ApiService.getProgramDataForSession(id.toString());
 if (programData.steps && programData.steps.length > 0) {
      // ✅ Получаем текущую температуру из первого показания
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
            time: minutesToTimeString(elapsedMinutes),
            temperature: temp,
          };
        })
        .filter((p: ChartDataPoint) => p.temperature !== undefined);

      setRuntimeData(newData); // ✅ ИСПОЛЬЗУЕМ СОСТОЯНИЕ
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
      // ✅ ИНТЕРВАЛ ТЕПЕРЬ ОБНОВЛЯЕТ СОСТОЯНИЕ
      interval = setInterval(() => loadRuntimeData(id), 60000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionId, isRunning, startTime]);

// Inside useSessionChartData hook

useEffect(() => {
    // This logic combines the two datasets and sorts them
    if (profileData.length === 0 && runtimeData.length === 0) {
        setChartData([]);
        return;
    }

    // Use a Map to combine points by their time string
    const mergedDataMap = new Map<string, ChartDataPoint>();

    // 1. Add all points from the profile data
    profileData.forEach(p => {
        mergedDataMap.set(p.time, { ...p });
    });

    // 2. Add all points from the runtime data.
    // If a point at this time already exists from the profile, add the temperature.
    // If it doesn't exist, create a new point.
    runtimeData.forEach(p => {
        const existing = mergedDataMap.get(p.time);
        if (existing) {
            // Point already exists from the profile, add the actual temperature
            mergedDataMap.set(p.time, { ...existing, temperature: p.temperature });
        } else {
            // This is a new time point from runtime data, add it
            mergedDataMap.set(p.time, { time: p.time, temperature: p.temperature, targetTemp: undefined });
        }
    });

    // 3. Convert the map back to a sorted array
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