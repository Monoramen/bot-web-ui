// src/hooks/useSessionChartData.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ApiService } from '@/services/apiService';
import { ChartDataPoint } from '@/types/session';

// Форматирование времени
const formatTime = (timestamp: string | null): string => {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  return date.toTimeString().slice(0, 5); // "HH:MM"
};

// Фильтрация корректных температурных значений
const isValidTemperature = (temp: number): boolean => {
  return typeof temp === 'number' && 
         !isNaN(temp) && 
         Math.abs(temp) < 1000 && // Фильтруем аномально большие значения
         temp >= 0 && // Не допускаем отрицательные температуры
         temp <= 1300; // Максимальная температура для керамики
};

// Объединение данных по времени
const mergeChartData = (
  realData: ChartDataPoint[], 
  profileData: ChartDataPoint[]
): ChartDataPoint[] => {
  const timeMap = new Map<string, ChartDataPoint>();

  // Сначала добавляем профильные данные
  profileData.forEach(point => {
    timeMap.set(point.time, { ...point });
  });

  // Затем добавляем реальные данные (перезаписывая при совпадении времени)
  realData.forEach(point => {
    if (timeMap.has(point.time)) {
      const existing = timeMap.get(point.time)!;
      timeMap.set(point.time, { ...existing, temperature: point.temperature });
    } else {
      timeMap.set(point.time, { ...point });
    }
  });

  return Array.from(timeMap.values()).sort((a, b) => {
    const [aH, aM] = a.time.split(':').map(Number);
    const [bH, bM] = b.time.split(':').map(Number);
    return aH * 60 + aM - (bH * 60 + bM);
  });
};

// Вспомогательная функция для преобразования минут в строку времени "HH:MM"
const minutesToTimeString = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const useSessionChartData = (sessionId: string | null, isRunning: boolean) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Используем useRef для хранения предыдущих данных и предотвращения лишних обновлений
  const prevSessionIdRef = useRef<string | null>(null);
  const prevChartDataRef = useRef<ChartDataPoint[]>([]);
  const isFetchingRef = useRef(false);

  const loadSessionData = useCallback(async (id: string) => {
    // Проверяем, не выполняется ли уже запрос
    if (isFetchingRef.current) return;
    
    // Добавляем более строгую проверку
    if (!id || id === 'f1' || isNaN(Number(id))) {
      console.warn('Skipping invalid session ID:', id);
      setChartData([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    // Проверяем, что sessionId - корректное число
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      setError(`Неверный ID сессии: ${id}`);
      setChartData([]);
      setIsLoading(false);
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log('Loading data for session:', numericId);
      
      // Параллельно загружаем данные программы и температуру
      const [programData, runtimeData] = await Promise.all([
        ApiService.getProgramDataForSession(numericId.toString()),
        ApiService.getRuntimeTemperature(numericId.toString())
      ]);

      console.log('Program data:', programData);
      console.log('Runtime data length:', runtimeData.length);

      // Реальные данные температуры из runtime (фильтруем некорректные значения)
      const realData: ChartDataPoint[] = runtimeData
        .map(reading => ({
          time: formatTime(reading.timestamp),
          temperature: isValidTemperature(reading.temperature) ? reading.temperature : undefined
        }))
        .filter(point => point.temperature !== undefined);

      console.log('Filtered real data points:', realData.length);

      // Целевой профиль из программы
      let profileData: ChartDataPoint[] = [];
      
      if (programData.steps && programData.steps.length > 0) {
        let currentTimeMinutes = 0;
        
        programData.steps.forEach((step) => {
          // Начало шага
          profileData.push({
            time: minutesToTimeString(currentTimeMinutes),
            targetTemp: step.target_temperature_c
          });

          // Конец шага (после ramp + hold)
          currentTimeMinutes += step.ramp_time_minutes + step.hold_time_minutes;
          profileData.push({
            time: minutesToTimeString(currentTimeMinutes),
            targetTemp: step.target_temperature_c
          });
        });

        console.log('Profile data points:', profileData.length);
      }

      // Объединяем данные
      const mergedData = mergeChartData(realData, profileData);
      console.log('Merged chart data:', mergedData.length);
      
      // Обновляем состояние только если данные изменились
      if (JSON.stringify(mergedData) !== JSON.stringify(prevChartDataRef.current)) {
        setChartData(mergedData);
        prevChartDataRef.current = mergedData;
      }

    } catch (error) {
      console.error("❌ Ошибка загрузки данных сессии:", error);
      setError(error instanceof Error ? error.message : 'Неизвестная ошибка');
      setChartData([]);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (sessionId && sessionId !== prevSessionIdRef.current) {
      prevSessionIdRef.current = sessionId;
      loadSessionData(sessionId);
    } else if (!sessionId) {
      setChartData([]);
      setError(null);
    }
  }, [sessionId, loadSessionData]);

  useEffect(() => {
    if (sessionId && isRunning) {
      const interval = setInterval(() => {
        loadSessionData(sessionId);
      }, 10000); // Увеличиваем интервал до 10 секунд для активных сессий
      
      return () => clearInterval(interval);
    }
  }, [sessionId, isRunning, loadSessionData]);

  return { chartData, isLoading, error };
};