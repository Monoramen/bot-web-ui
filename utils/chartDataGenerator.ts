// src/utils/chartDataGenerator.ts

import { FiringProgram, ProgramStep } from '@/types/session';

export const generateChartData = (program: FiringProgram): { time: number; temperature: number }[] => {
  const chartPoints: { time: number; temperature: number }[] = [];
  let currentTime = 0;

  // Начинаем с 0°C в 0 минут
  chartPoints.push({ time: 0, temperature: 0 });

  program.steps.forEach((step: ProgramStep) => {
    // Пропускаем пустые шаги
    if (step.target_temperature_c === 0 && step.ramp_time_minutes === 0) return;

    // Фиксируем текущую температуру перед началом разгона
    const lastTemp = chartPoints[chartPoints.length - 1]?.temperature ?? 0;
    chartPoints.push({ time: currentTime, temperature: lastTemp });

    // Разгон
    currentTime += step.ramp_time_minutes;
    chartPoints.push({ time: currentTime, temperature: step.target_temperature_c });

    // Выдержка
    currentTime += step.hold_time_minutes;
    chartPoints.push({ time: currentTime, temperature: step.target_temperature_c });
  });

  return chartPoints;
};