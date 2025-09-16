'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Label,
  Legend, // ✅ Импортируем Legend
} from 'recharts';
import { Program, ChartDataPoint } from '@/types/types';

interface DeviceParametersChartProps {
  program: Program;
}

// A more visually distinct color palette for charts.
const programColors = [
  '#00B3E6', // A vibrant blue
  '#B3E600', // A bright lime green
  '#88c21eff', // A deep magenta
  '#99e708ff', // A golden yellow
  '#00E6B3', // A cool turquoise
  '#B300E6', // A rich purple
  '#E60000', // A fiery red
  '#00E600', // A classic green
  '#B3B3B3', // A neutral grey
  '#E6E600', // A sunny yellow
];

const DeviceParameterChart: React.FC<DeviceParametersChartProps> = ({ program }) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isDark, setIsDark] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Generates data points for the temperature graph from the program's steps.
  const generateChartData = (prog: Program) => {
    const chartPoints: ChartDataPoint[] = [];
    let currentTime = 0;

    // Start from time 0, temperature 0.
    chartPoints.push({ time: 0, temperature: 0, targetTemp: 0 });

    prog.steps.forEach((step) => {
      // Skip steps with no ramp or target temp to avoid plotting invalid points.
      if (step.target_temperature_c === 0 && step.ramp_time_minutes === 0) return;

      const lastTemp = chartPoints[chartPoints.length - 1]?.temperature ?? 0;
      
      // Add point for the start of the ramp.
      chartPoints.push({ time: currentTime, temperature: lastTemp, targetTemp: null });

      // Add point for the end of the ramp (reaching target temperature).
      currentTime += step.ramp_time_minutes;
      chartPoints.push({ time: currentTime, temperature: step.target_temperature_c, targetTemp: null });

      // Add point for the end of the hold time.
      currentTime += step.hold_time_minutes;
      chartPoints.push({ time: currentTime, temperature: step.target_temperature_c, targetTemp: null });
    });

    setChartData(chartPoints);
  };

  // Tracks the current theme (light/dark) for styling.
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Re-generate chart data whenever the program prop changes.
  useEffect(() => {
    if (program?.steps?.length) {
      generateChartData(program);
    } else {
      setChartData([]);
    }
  }, [program]);

  // Fallback UI if there's no program data.
  if (!program?.steps?.length) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center bg-card rounded-lg">
        <p className="text-muted-foreground">Нет данных для отображения</p>
      </div>
    );
  }

  // Define colors based on the current theme.
  const gridColor = isDark ? '#8C3F2840' : '#E3C5A060';
  const axisColor = isDark ? '#8C3F28' : '#E3C5A0';
  const textColor = isDark ? '#F5E3D0' : '#1C1C1C';
  const backgroundColor = isDark ? '#3A2B20' : '#F5E3D0';

  // Choose a unique, stable color for the chart based on the program ID.
  const currentProgramColor = programColors[program.id % programColors.length];

  return (
    <div className="w-full h-[280px] " ref={chartRef}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}> {/* Увеличены отступы */}
          <defs>
            <linearGradient id={`colorTemperature${program.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={currentProgramColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={currentProgramColor} stopOpacity={0.1} />
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
            axisLine={{ stroke: axisColor }}
            tickLine={{ stroke: axisColor }}
            interval="preserveStartEnd"
          >
            <Label
              value="Время (мин)"
              position="insideBottom"
              fill={textColor}
              offset={-5} // Скорректирован отступ
              style={{ fontSize: '12px' }}
            />
          </XAxis>
          <YAxis
            tick={{ fill: textColor, fontSize: 12 }}
            axisLine={{ stroke: axisColor }}
            tickLine={{ stroke: axisColor }}
            domain={[0, 'dataMax + 50']}
            width={90} // Увеличена ширина оси
          >
            <Label
              value="Температура (°C)"
              angle={-90}
              position="insideLeft"
              fill={textColor}
              style={{ fontSize: '12px' }}
              offset={20} // Скорректирован отступ
            />
          </YAxis>
          <Tooltip
            contentStyle={{
              backgroundColor,
              border: `1px solid ${axisColor}`,
              borderRadius: '0.625rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              color: textColor,
            }}
            labelStyle={{ color: textColor, fontWeight: '600' }}
            formatter={(value: number) => [`${value}°C`, 'Температура']}
            labelFormatter={(time: number) => `Время: ${time} мин`}
          />
          <Legend
            verticalAlign="top"
            align="center"
            wrapperStyle={{ paddingBottom: '1rem' }}
          />
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
          <Line
            type="monotone"
            dataKey="temperature"
            name={program.name}
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
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DeviceParameterChart;