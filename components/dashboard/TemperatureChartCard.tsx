// src/components/dashboard/TemperatureChartCard.tsx
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, memo } from "react";
import ChartLoader from './ChartLoader';
import ChartEmptyState from '@/components/dashboard/ChartEmptyState';
import ChartRenderer from '@/components/dashboard/ChartRenderer';
import { useSessionChartData } from '@/hooks/useSessionChartData';

interface TemperatureChartCardProps {
  sessionId: string | null;
  isRunning: boolean;
  startTime: string | null;
}

function TemperatureChartCard({ sessionId, isRunning, startTime }: TemperatureChartCardProps) {
  const { chartData, isLoading, error } = useSessionChartData(sessionId, isRunning, startTime);
  const [isDark, setIsDark] = useState(false);

  // Отслеживаем тему (только один раз при монтировании)
  useEffect(() => {
    const checkTheme = () => {
      const darkMode = document.documentElement.classList.contains('dark');
      setIsDark(darkMode);
    };
    
    // Проверяем тему сразу
    checkTheme();
    
    // Настраиваем observer для отслеживания изменений темы
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });
    
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <Card className="md:col-span-2">
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">
          {sessionId ? `Температура сессии #${sessionId}` : 'Температура и профиль программы'}
        </h2>
        
        {isLoading && <ChartLoader />}
        
        {error && (
          <div className="flex flex-col items-center justify-center h-64 text-destructive">
            <div className="text-4xl mb-2">❌</div>
            <p className="text-lg font-medium mb-2">Ошибка загрузки</p>
            <p className="text-sm text-center">{error}</p>
          </div>
        )}
        
        {!isLoading && !error && chartData.length === 0 && (
          <ChartEmptyState sessionId={sessionId} />
        )}
        
        {!isLoading && !error && chartData.length > 0 && (
          <ChartRenderer data={chartData} isDark={isDark} />
        )}
      </CardContent>
    </Card>
  );
}

export default memo(TemperatureChartCard);