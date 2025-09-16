// src/components/FiringProgramChart.tsx
'use client';

import React from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
} from 'recharts';
import { useFiringProgramChart } from '@/hooks/useFiringProgramChart';
import { FiringProgram } from '@/types/session';

interface FiringProgramChartProps {
  programId: number | null;
  programData?: FiringProgram;
}

const programColors = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

// ✅ Функция для форматирования минут в читаемый вид
const formatMinutes = (minutes: number) => {
  if (minutes < 60) {
    return `${Math.round(minutes)} мин`; // Округляем до целых
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60); // Округляем до целых
  return remainingMinutes > 0 
    ? `${hours}ч ${remainingMinutes}мин` 
    : `${hours}ч`;
};

// ✅ Функция для преобразования секунд в минуты и форматирования
const formatSecondsToReadable = (seconds: number) => {
  const minutes = seconds / 60; // Конвертируем секунды в минуты
  return formatMinutes(minutes);
};

const FiringProgramChart: React.FC<FiringProgramChartProps> = ({ programId, programData }) => {
  const { program, chartData, isDark, isLoading } = useFiringProgramChart({
    programId,
    programData,
  });

  // ✅ Преобразуем данные: секунды → минуты
  const formattedChartData = chartData.map(item => ({
    ...item,
    time: item.time / 60, // Конвертируем секунды в минуты
  }));

  if (!programId) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <p className="text-muted-foreground md:p-6">Выберите программу для отображения графика</p>
      </div>
    );
  }

  if (isLoading || !program) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  const gridColor = isDark ? '#8C3F2840' : '#E3C5A060';
  const axisColor = isDark ? '#8C3F28' : '#E3C5A0';
  const textColor = isDark ? '#F5E3D0' : '#1C1C1C';
  const backgroundColor = isDark ? '#3A2B20' : '#F5E3D0';

  const programColorIndex = (program.id - 1) % programColors.length;
  const currentProgramColor = programColors[programColorIndex];

  return (
    <div className="w-full h-full min-h-[180px] p-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedChartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`colorTemperature${program.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={currentProgramColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={currentProgramColor} stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} opacity={0.7} />

          <XAxis
            dataKey="time"
            tick={{ fill: textColor, fontSize: 12 }}
            axisLine={{ stroke: axisColor }}
            tickLine={{ stroke: axisColor }}
            interval="preserveStartEnd"
            tickFormatter={formatMinutes} // ✅ Используем форматирование минут
          >
            <Label
              value="Время"
              position="insideBottom"
              fill={textColor}
              offset={0}
              style={{ fontSize: '12px' }}
            />
          </XAxis>

          <YAxis
            tick={{ fill: textColor, fontSize: 12 }}
            axisLine={{ stroke: axisColor }}
            tickLine={{ stroke: axisColor }}
            domain={[0, 'dataMax + 50']}
            width={50}
          >
            <Label
              value="Температура (°C)"
              angle={-90}
              position="insideLeft"
              fill={textColor}
              style={{ fontSize: '12px' }}
              offset={10}
            />
          </YAxis>

          <Tooltip
            contentStyle={{
              backgroundColor: backgroundColor,
              border: `1px solid ${axisColor}`,
              borderRadius: '0.625rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              color: textColor,
            }}
            labelStyle={{ color: textColor, fontWeight: '600' }}
            formatter={(value) => [`${value}°C`, 'Температура']}
            labelFormatter={(minutes) => `Время: ${formatMinutes(minutes)}`} // ✅ Форматируем минуты
          />

          <Legend
            wrapperStyle={{ color: textColor, fontSize: '12px' }}
            align="center"
            verticalAlign="top"
            height={36}
          />

          {/* Заливка под графиком */}
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="transparent"
            fillOpacity={1}
            fill={`url(#colorTemperature${program.id})`}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />

          {/* Основная линия */}
          <Line
            type="monotone"
            dataKey="temperature"
            name={program.name || 'Температура'}
            stroke={currentProgramColor}
            strokeWidth={3}
            dot={{
              r: 5,
              fill: currentProgramColor,
              strokeWidth: 2,
              stroke: backgroundColor,
            }}
            activeDot={{
              r: 7,
              stroke: currentProgramColor,
              strokeWidth: 2,
              fill: backgroundColor,
            }}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FiringProgramChart;