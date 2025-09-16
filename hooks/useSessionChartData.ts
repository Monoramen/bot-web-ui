// src/hooks/useSessionChartData.ts
'use client';

import { useState, useEffect, useRef } from 'react';
import { ApiService } from '@/services/apiService';
import { ChartDataPoint } from '@/types/session';

const formatTime = (timestamp: string | null): string => {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  return date.toTimeString().slice(0, 5);
};

const isValidTemperature = (temp: number): boolean =>
  typeof temp === 'number' &&
  !isNaN(temp) &&
  temp >= 0 &&
  temp <= 1300;

const minutesToTimeString = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`;
};

export const useSessionChartData = (sessionId: string | null, isRunning: boolean, startTime: string | null ) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [profileData, setProfileData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prevDataRef = useRef<ChartDataPoint[]>([]);
  const MAX_POINTS = 80;

  // ✅ Загружаем программу только один раз
  const loadProgramData = async (id: number) => {
    try {
      const programData = await ApiService.getProgramDataForSession(id.toString());

      if (programData.steps && programData.steps.length > 0) {
        let profile: ChartDataPoint[] = [];
        let currentTimeMinutes = 0;

        // Если startTime не задан — не можем синхронизировать время
        if (!startTime) {
          console.warn("startTime не передан, целевая температура не будет отображаться корректно");
          return;
        }

        programData.steps.forEach((step: any) => {
          const targetTemp = step.target_temperature_c ?? undefined;

          // Точка начала этапа
          profile.push({
            time: minutesToTimeString(currentTimeMinutes),
            targetTemp,
          });

          // Переходим к концу этапа
          currentTimeMinutes += step.ramp_time_minutes + step.hold_time_minutes;
          profile.push({
            time: minutesToTimeString(currentTimeMinutes),
            targetTemp,
          });
        });

        setProfileData(profile);
      }
    } catch (e) {
      console.error("Ошибка загрузки программы:", e);
      setError(e instanceof Error ? e.message : 'Ошибка загрузки профиля');
    }
  };
// ✅ Подгружаем runtime-данные (новые точки)
  const loadRuntimeData = async (id: number) => {
    try {
      // ВСЕГДА используем getSessionTemperatureReadings — для любых сессий
      const runtimeData = await ApiService.getSessionTemperatureReadings(id.toString());

      // Если нет startTime — не можем вычислить время с начала
      if (!startTime) {
        console.warn("startTime не передан, реальные данные не будут синхронизированы");
        return;
      }

      const sessionStart = new Date(startTime).getTime();

      // Фильтруем и преобразуем данные
      const newData: ChartDataPoint[] = runtimeData
        .map((reading: any) => {
          const readingTime = new Date(reading.timestamp).getTime();
          const elapsedMinutes = Math.floor((readingTime - sessionStart) / 60000); // в минутах

          // Фильтруем бессмысленные значения (ошибки сенсора)
          let temp = reading.temperature;
          if (
            typeof temp !== 'number' ||
            isNaN(temp) ||
            temp < -50 || // ниже -50°C — нереально
            temp > 1500 || // выше 1500°C — нереально для печи
            !isFinite(temp) // Infinity, -Infinity
          ) {
            temp = undefined;
          }

          return {
            time: minutesToTimeString(elapsedMinutes),
            temperature: temp,
          };
        })
        .filter((p: ChartDataPoint) => p.temperature !== undefined); // оставляем только валидные

      // только новые точки (после последней сохранённой)
      const lastTime = prevDataRef.current.length
        ? prevDataRef.current[prevDataRef.current.length - 1].time
        : null;

      const merged = [...prevDataRef.current];
      newData.forEach((point) => {
        if (!lastTime || point.time > lastTime) {
          merged.push(point);
        }
      });

      // объединяем с profileData (целевые температуры)
      const timeMap = new Map<string, ChartDataPoint>();
      [...profileData, ...merged].forEach((p) => {
        const existing = timeMap.get(p.time) || {};
        timeMap.set(p.time, { ...existing, ...p });
      });

      const sorted = Array.from(timeMap.values()).sort((a, b) => a.time.localeCompare(b.time));
      const limited = sorted.slice(-MAX_POINTS);

      prevDataRef.current = limited;
      setChartData(limited);
    } catch (e) {
      console.error("Ошибка загрузки данных температуры:", e);
      setError(e instanceof Error ? e.message : 'Ошибка загрузки температуры');
    }
  };

  useEffect(() => {
    if (!sessionId) {
      setChartData([]);
      setProfileData([]);
      prevDataRef.current = [];
      return;
    }

    const id = parseInt(sessionId, 10);
    if (isNaN(id)) return;

    setIsLoading(true);
    setError(null);

    // загружаем программу только один раз
    loadProgramData(id).then(() => {
      loadRuntimeData(id).finally(() => setIsLoading(false));
    });

    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      // 🔥 Подгружаем runtime только раз в минуту
      interval = setInterval(() => loadRuntimeData(id), 60000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionId, isRunning]);

  return { chartData, isLoading, error };
};
