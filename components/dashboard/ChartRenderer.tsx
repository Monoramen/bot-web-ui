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
  const filteredData = data.filter(point => 
    point.temperature !== undefined || point.targetTemp !== undefined
  );
return (
    <div className="w-full h-[400px] rounded-lg p-4 border border-border bg-card shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={filteredData}
          margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
        >
          <defs>
            <linearGradient id="realTempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={realLineColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={realLineColor} stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="targetTempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={targetLineColor} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={targetLineColor} stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={gridColor}
            vertical={false}
            opacity={0.7}
          />
          
          <XAxis
            dataKey="time"
            tick={{ fill: textColor, fontSize: 12 }}
            interval={0}
            axisLine={{ stroke: axisColor }}
            tickLine={{ stroke: axisColor }}
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
          
          {/* 👇 Сначала рисуем заливки и линии реальной температуры — чтобы они были ПОД целевой */}
          
          {/* Заливка под реальной линией */}
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="transparent"
            fillOpacity={1}
            fill="url(#realTempGradient)"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
          
          {/* Реальная линия — ЗЕЛЁНАЯ */}
          <Line
            type="monotone"
            dataKey="temperature"
            name="Реальная температура"
            stroke={realLineColor}
            strokeWidth={3}
            dot={{ 
              r: 5, 
              fill: realLineColor,
              strokeWidth: 2,
              stroke: backgroundColor
            }}
            activeDot={{ 
              r: 7, 
              stroke: realLineColor, 
              strokeWidth: 2,
              fill: backgroundColor
            }}
            isAnimationActive={true}
            animationDuration={300}
          />
          
          {/* Заливка под целевой линией */}
          <Line
            type="monotone"
            dataKey="targetTemp"
            stroke="transparent"
            fillOpacity={1}
            fill="url(#targetTempGradient)"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
          
          {/* Целевая линия — поверх всех */}
          <Line
            type="monotone"
            dataKey="targetTemp"
            name="Целевая температура"
            stroke={targetLineColor}
            strokeWidth={3}
            dot={{ 
              r: 5, 
              fill: targetLineColor,
              strokeWidth: 2,
              stroke: backgroundColor
            }}
            activeDot={{ 
              r: 7, 
              stroke: targetLineColor, 
              strokeWidth: 2,
              fill: backgroundColor
            }}
            isAnimationActive={true}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};