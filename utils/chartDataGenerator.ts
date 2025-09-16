// src/utils/chartDataGenerator.ts
import { FiringProgram, ProgramStep } from '@/types/session';

export const generateChartData = (program: FiringProgram): { time: number; temperature: number }[] => {
  const chartPoints: { time: number; temperature: number }[] = [];
  let currentTime = 0; // Время в минутах
  let lastTemperature = 0;

  // Начинаем с 0°C в 0 минут
  chartPoints.push({ time: 0, temperature: 0 });

  program.steps.forEach((step: ProgramStep) => {
    // Пропускаем пустые шаги
    if (step.target_temperature_c === 0 && step.ramp_time_minutes === 0) return;

    // ✅ Преобразуем секунды в минуты (делим на 60)
    const rampTimeMinutes = step.ramp_time_minutes / 60;
    const holdTimeMinutes = step.hold_time_minutes / 60;

    // Добавляем промежуточные точки для разгона
    const rampPoints = Math.max(2, Math.ceil(rampTimeMinutes / 10));
    for (let i = 1; i <= rampPoints; i++) {
      const timeIncrement = (rampTimeMinutes * i) / rampPoints;
      const tempIncrement = ((step.target_temperature_c - lastTemperature) * i) / rampPoints;
      
      chartPoints.push({
        time: currentTime + timeIncrement, // Не округляем здесь
        temperature: Math.round(lastTemperature + tempIncrement)
      });
    }

    currentTime += rampTimeMinutes;
    lastTemperature = step.target_temperature_c;

    // Добавляем точки выдержки (начало и конец)
    chartPoints.push({ 
      time: currentTime, // Не округляем здесь
      temperature: lastTemperature 
    });
    
    if (holdTimeMinutes > 0) {
      currentTime += holdTimeMinutes;
      chartPoints.push({ 
        time: currentTime, // Не округляем здесь
        temperature: lastTemperature 
      });
    }
  });

  // Округляем время только в конце для всех точек
  return chartPoints.map(point => ({
    ...point,
    time: Math.round(point.time) // Округляем до целых минут
  }));
};