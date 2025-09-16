// src/hooks/useFiringProgramChart.ts
'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/services/apiService';
import { FiringProgram } from '@/types/session';
import { generateChartData } from '@/utils/chartDataGenerator';

interface UseFiringProgramChartProps {
  programId: number | null;
  programData?: FiringProgram;
}

interface ProgramWithTimeScale extends FiringProgram {
  timeScale?: number; // 0 = часы/минуты, 1 = минуты/секунды
}

export const useFiringProgramChart = ({ programId, programData }: UseFiringProgramChartProps) => {
  const [program, setProgram] = useState<ProgramWithTimeScale | null>(null);
  const [chartData, setChartData] = useState<{ time: number; temperature: number }[]>([]);
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Функция преобразования времени из формата устройства в секунды
  const convertDeviceTimeToSeconds = (timeValue: number, scale: number = 0) => {
    if (scale === 0) {
      // Режим "часы/минуты": HHMM → секунды
      const hours = Math.floor(timeValue / 100);
      const minutes = timeValue % 100;
      return hours * 3600 + minutes * 60;
    } else {
      // Режим "минуты/секунды": MMSS → секунды
      const minutes = Math.floor(timeValue / 100);
      const seconds = timeValue % 100;
      return minutes * 60 + seconds;
    }
  };

  // Функция преобразования данных графика с учетом масштаба времени
  const transformChartData = (programData: ProgramWithTimeScale) => {
    const rawChartData = generateChartData(programData);
    const timeScale = programData.timeScale || 0; // По умолчанию часы/минуты

    return rawChartData.map(item => ({
      ...item,
      time: convertDeviceTimeToSeconds(item.time, timeScale) / 60, // Конвертируем в минуты
    }));
  };

  // Отслеживаем тему
  useEffect(() => {
    const checkTheme = () => {
      const darkMode = document.documentElement.classList.contains('dark');
      setIsDark(darkMode);
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Загружаем или обновляем данные программы
  useEffect(() => {
    if (programData) {
      const programWithTimeScale = programData as ProgramWithTimeScale;
      setProgram(programWithTimeScale);
      setChartData(transformChartData(programWithTimeScale));
      return;
    }

    if (!programId) {
      setChartData([]);
      setProgram(null);
      return;
    }

    const fetchProgram = async () => {
      setIsLoading(true);
      try {
        // Предполагаем, что API возвращает программу с полем timeScale
        const data = await ApiService.getFiringProgramForChart(programId) as ProgramWithTimeScale;
        setProgram(data);
        setChartData(transformChartData(data));
      } catch (error) {
        console.error('Error fetching program:', error);
        setChartData([]);
        setProgram(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgram();
  }, [programId, programData]);

  return {
    program,
    chartData,
    isDark,
    isLoading,
  };
};