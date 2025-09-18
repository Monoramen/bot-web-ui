// src/utils/chartDataGenerator.ts

import { FiringProgram, ProgramStep } from '@/types/session';

export const generateChartData = (program: FiringProgram): { time: number; temperature: number }[] => {
    const chartPoints: { time: number; temperature: number }[] = [];
    let currentTime = 0;
    let lastTemperature = 0;

    // Начальная точка: 0°C в 0 минут.
    chartPoints.push({ time: 0, temperature: 0 });

    program.steps.forEach((step: ProgramStep) => {
        // Пропускаем шаги, если нет ни разгона, ни выдержки.
        if (step.target_temperature_c === 0 && step.ramp_time_minutes === 0 && step.hold_time_minutes === 0) {
            return;
        }

        // Если есть разгон, добавляем точку в конце разгона.
        if (step.ramp_time_minutes > 0) {
            currentTime += step.ramp_time_minutes;
            chartPoints.push({
                time: currentTime,
                temperature: step.target_temperature_c,
            });
        }

        // Если есть выдержка, добавляем точку в конце выдержки.
        if (step.hold_time_minutes > 0) {
            currentTime += step.hold_time_minutes;
            chartPoints.push({
                time: currentTime,
                temperature: step.target_temperature_c,
            });
        }
        
        // Обновляем последнюю температуру для следующего шага.
        lastTemperature = step.target_temperature_c;
    });

    // Округляем время до целых минут для всех точек, чтобы оси выглядели чище.
    return chartPoints.map(point => ({
        ...point,
        time: Math.round(point.time)
    }));
};