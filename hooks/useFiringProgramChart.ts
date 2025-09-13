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

export const useFiringProgramChart = ({ programId, programData }: UseFiringProgramChartProps) => {
  const [program, setProgram] = useState<FiringProgram | null>(null);
  const [chartData, setChartData] = useState<{ time: number; temperature: number }[]>([]);
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      setProgram(programData);
      setChartData(generateChartData(programData));
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
        const data = await ApiService.getFiringProgramForChart(programId);
        setProgram(data);
        setChartData(generateChartData(data));
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