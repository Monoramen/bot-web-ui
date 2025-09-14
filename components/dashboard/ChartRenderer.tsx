// src/components/dashboard/ChartRenderer.tsx
'use client';

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
} from "recharts";
import { ChartDataPoint } from '@/types/session';

interface ChartRendererProps {
  data: ChartDataPoint[];
  isDark: boolean;
}

export default function ChartRenderer({ data, isDark }: ChartRendererProps) {
  const gridColor = isDark ? '#8C3F2840' : '#E3C5A060';
  const axisColor = isDark ? '#8C3F28' : '#E3C5A0';
  const textColor = isDark ? '#F5E3D0' : '#1C1C1C';
  const backgroundColor = isDark ? '#3A2B20' : '#F5E3D0';
  const realLineColor = isDark ? '#26dd20ff' : '#7dd42cff';
  const targetLineColor = isDark ? '#75B0F0' : '#4C7AD1';

  // ✅ БЕЗОПАСНАЯ ПОДГОТОВКА ДАННЫХ: заменяем null → undefined
// ✅ SAFE VERSION: Use null, not undefined
const filteredData = data
  .map(point => ({
    ...point,
    temperature: point.temperature === null ? null : point.temperature,
    targetTemp: point.targetTemp === null ? null : point.targetTemp,
  }))
  .filter(point => 
    point.temperature !== null || point.targetTemp !== null
  );

  // ✅ Включаем анимацию только при достаточном количестве точек
  const shouldAnimate = filteredData.length > 10;

  return (
    <div className="w-full h-[400px] rounded-lg p-4 border border-border bg-card shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 

          data={filteredData}
          margin={{ top: 0, right: 10, bottom: 20, left: 10 }}
          animationDuration={800}
          animationEasing="easeInOut"
          shouldUpdate={true}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={gridColor}
            vertical={false}
            opacity={0.7}
          />
          
          <XAxis
            dataKey="time"
            tick={{ fill: textColor, fontSize: 12 }}
            interval={Math.max(0, filteredData.length - 10)}
            axisLine={{ stroke: axisColor }}
            tickLine={{ stroke: axisColor }}
            minTickGap={20}
          >
            <Label
              value="Время (чч:мм)"
              offset={-10}
              position="insideBottom"
              fill={textColor}
              style={{ fontSize: '12px' }}
            />
          </XAxis>
          
          <YAxis
            domain={[0, 1300]}
            tick={{ fill: textColor, fontSize: 12 }}
            axisLine={{ stroke: axisColor }}
            tickLine={{ stroke: axisColor }}
          >
            <Label
              value="Температура °C"
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
              color: textColor
            }}
            labelStyle={{ color: textColor, fontWeight: '600' }}
            formatter={(value: number, name: string) => {
              if (value === undefined || value === null) return ['—', name];
              return [`${value.toFixed(1)}°C`, name];
            }}
            labelFormatter={(time) => `Время: ${time}`}
          />
          
          <Legend 
            wrapperStyle={{ color: textColor, fontSize: '12px' }} 
            align="center"
            verticalAlign="top"
            height={36}
          />

          <Line
            type="linear"
            dataKey="targetTemp"
            name="Целевая температура"
            stroke={targetLineColor}
            strokeWidth={3}
            strokeDasharray="6 4" // 👈 пунктир
            dot={false}
            activeDot={false}
            isAnimationActive={shouldAnimate}
          />

          <Line
            type="linear"
            dataKey="temperature"
            name="Реальная температура"
            stroke={realLineColor}
            strokeWidth={4}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2, stroke: realLineColor }}
            isAnimationActive={shouldAnimate}
          />


          
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}