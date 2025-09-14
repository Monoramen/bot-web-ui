// src/hooks/useRemainingTime.ts
'use client';

import { useEffect, useState } from 'react';
import { FiringProgram } from '@/types/session';

export interface RemainingInfo {
  remainingMinutes: number; // Остаток в минутах (например, 2.75)
  currentStepInfo?: {
    index: number;
    targetTemp: number;
    remainingInStep: number; // тоже в минутах
  };
}

// ✅ Вспомогательная функция: переводит минуты в строку MM:SS
const formatTime = (minutes: number): string => {
  if (minutes < 0) minutes = 0;
  const totalSeconds = Math.round(minutes * 60); // округляем до целых секунд
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const useRemainingTime = (
  program: FiringProgram | undefined,
  startTime: string | undefined
): RemainingInfo => {
  const [result, setResult] = useState<RemainingInfo>({
    remainingMinutes: 0,
  });

  useEffect(() => {
    if (!program || !startTime || !program.steps.length) {
      setResult({ remainingMinutes: 0 });
      return;
    }

    const calculate = () => {
      const totalDuration = program.steps.reduce(
        (sum, step) => sum + step.ramp_time_minutes + step.hold_time_minutes,
        0
      );

      const now = new Date();
      const startedAt = new Date(startTime);
      const elapsedMinutes = (now.getTime() - startedAt.getTime()) / (1000 * 60); // ✅ ИСПРАВЛЕНО: делить на 60, а не 3600!

      let remaining = Math.max(0, totalDuration - elapsedMinutes);

      let currentStepInfo: RemainingInfo['currentStepInfo'] = undefined;

      if (elapsedMinutes < totalDuration) {
        let accumulated = 0;
        for (let i = 0; i < program.steps.length; i++) {
          const step = program.steps[i];
          const stepDuration = step.ramp_time_minutes + step.hold_time_minutes;

          if (elapsedMinutes >= accumulated && elapsedMinutes < accumulated + stepDuration) {
            const timeInStep = elapsedMinutes - accumulated;
            currentStepInfo = {
              index: i + 1,
              targetTemp: step.target_temperature_c,
              remainingInStep: stepDuration - timeInStep,
            };
            break;
          }

          accumulated += stepDuration;
        }
      }

      setResult({
        remainingMinutes: remaining,
        currentStepInfo,
      });
    };

    calculate(); // Вычислить сразу

    const interval = setInterval(calculate, 1000); // Обновлять каждую секунду
    return () => clearInterval(interval);
  }, [program, startTime]);

  return result;
};