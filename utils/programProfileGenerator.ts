import { FiringProgram, ProgramStep, ChartDataPoint } from '@/types/session';

const minutesToTimeString = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const generateProgramProfile = (program: FiringProgram): ChartDataPoint[] => {
  if (!program || !program.steps || program.steps.length === 0) {
    return [];
  }

  const profilePoints: ChartDataPoint[] = [];
  let currentTimeMinutes = 0;
  let lastTemperature = 0;

  // Начальная точка
  profilePoints.push({
    time: minutesToTimeString(0),
    targetTemp: 0,
    temperature: undefined,
  });

  program.steps.forEach((step: ProgramStep, index) => {
    const startTemp = lastTemperature;
    const endTemp = step.target_temperature_c;
    const rampTime = step.ramp_time_minutes;
    const holdTime = step.hold_time_minutes;

    // ✅ Правило из generateChartData: пропускаем шаги, если нет ни разгона, ни выдержки, и температура 0
    if (endTemp === 0 && rampTime === 0 && holdTime === 0) {
      return;
    }

    // ✅ ВАЖНО: Если температура шага 0 — НЕ генерируем для него точки (кроме случая, если это активный разгон вниз)
    if (endTemp === 0 && rampTime === 0) {
      // Это "мёртвый" шаг 0°C — не добавляем его в график
      return;
    }

    // Генерируем точки для этапа разгона (Ramp)
    if (rampTime > 0) {
      const startRampTime = currentTimeMinutes;
      const endRampTime = currentTimeMinutes + rampTime;
      const numPoints = Math.max(10, Math.round(rampTime * 2));

      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const temp = startTemp + (endTemp - startTemp) * t;
        const time = startRampTime + rampTime * t;
        profilePoints.push({
          time: minutesToTimeString(time),
          targetTemp: Math.round(temp),
          temperature: undefined,
        });
      }
      currentTimeMinutes = endRampTime;
    } else {
      // Если разгона нет, просто переходим к целевой температуре
      // ✅ Но если endTemp === 0 — мы уже пропустили выше
      profilePoints.push({
        time: minutesToTimeString(currentTimeMinutes),
        targetTemp: endTemp,
        temperature: undefined,
      });
    }

    // Генерируем точки для этапа выдержки (Hold)
    if (holdTime > 0) {
      const endHoldTime = currentTimeMinutes + holdTime;
      profilePoints.push({
        time: minutesToTimeString(endHoldTime),
        targetTemp: endTemp,
        temperature: undefined,
      });
      currentTimeMinutes = endHoldTime;
    }

    lastTemperature = endTemp;
  });

  // ✅ УДАЛЯЕМ ЛЮБУЮ ФИНАЛЬНУЮ ТОЧКУ С 0°C — НИКОГДА НЕ ДОБАВЛЯЕМ ЕЁ
  // (в отличие от предыдущей версии — теперь мы вообще не добавляем 0°C в конце)

  return profilePoints;
};