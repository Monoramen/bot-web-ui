'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/services/apiService';
import { FiringProgram } from '@/types/session';
import { generateChartData } from '@/utils/chartDataGenerator'; // ✅ Импортируем функцию

interface UseFiringProgramChartProps {
  programId: number | null;
  programData?: FiringProgram;
}

export const useFiringProgramChart = ({ programId, programData }: UseFiringProgramChartProps) => {
  const [program, setProgram] = useState<FiringProgram | null>(null);
  const [chartData, setChartData] = useState<{ time: number; temperature: number }[]>([]);
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Отслеживаем тему
  useEffect(() => {
    const checkTheme = () => {
      const darkMode = document.documentElement.classList.contains('dark');
      setIsDark(darkMode);
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // ✅ Загружаем или обновляем данные программы
  useEffect(() => {
    if (!programId && !programData) {
      setChartData([]);
      setProgram(null);
      return;
    }

    const processProgramData = (data: FiringProgram) => {
      // ✅ Используем импортированную функцию для генерации данных
      const newChartData = generateChartData(data); 

      setProgram(data);
      setChartData(newChartData);
      setIsLoading(false);
    };

    if (programData) {
      setIsLoading(true);
      processProgramData(programData);
      return;
    }

    const fetchProgram = async () => {
      if (!programId) return;
      setIsLoading(true);
      try {
        const data = await ApiService.getFiringProgramForChart(programId);
        if (data) {
          processProgramData(data);
        } else {
          setChartData([]);
          setProgram(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching program:', error);
        setChartData([]);
        setProgram(null);
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