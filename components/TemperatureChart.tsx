"use client";

import { useState, useEffect, useRef } from "react";
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

export default function RealTimeTemperatureChart() {
  const [data, setData] = useState<{ time: string; temperature: number }[]>([]);
  const [isDark, setIsDark] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Отслеживаем тему
  useEffect(() => {
    const checkTheme = () => {
      const darkMode = document.documentElement.classList.contains('dark');
      setIsDark(darkMode);
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:9090/api/modbus/");
      const json = await response.json();

      const newData = json.map((item: any) => ({
        time: item.timestamp.slice(11, 16), // часы:минуты
        temperature: item.temperature,
      }));

      setData((prev) => {
        const updated = [...prev, ...newData].slice(-15);
        return updated;
      });
    } catch (err) {
      console.error("Ошибка при получении данных:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Адаптивные цвета
  const gridColor = isDark ? '#8C3F2840' : '#E3C5A060';
  const axisColor = isDark ? '#8C3F28' : '#E3C5A0';
  const textColor = isDark ? '#F5E3D0' : '#1C1C1C';
  const backgroundColor = isDark ? '#3A2B20' : '#F5E3D0';
  const lineColor = isDark ? '#F0A975' : '#D17A4C';

  return (
    <div className="w-full h-[400px] rounded-lg p-4 border border-border bg-card shadow-sm" ref={chartRef}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={data}
          margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
        >
          <defs>
            <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={lineColor} stopOpacity={0.05}/>
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
            tick={{ 
              fill: textColor,
              fontSize: 12
            }}
            tickFormatter={(value) => value}
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
            domain={[20, 1200]}
            tick={{ 
              fill: textColor,
              fontSize: 12
            }}
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
            labelStyle={{ 
              color: textColor, 
              fontWeight: '600' 
            }}
            formatter={(value) => [`${value}°C`, "Температура"]}
            labelFormatter={(time) => `Время: ${time}`}
          />
          <Legend 
            wrapperStyle={{ 
              color: textColor, 
              fontSize: '12px' 
            }} 
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
            fill="url(#temperatureGradient)"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
          {/* Основная линия */}
          <Line
            type="monotone"
            dataKey="temperature"
            name="Температура"
            stroke={lineColor}
            strokeWidth={3}
            dot={{ 
              r: 5, 
              fill: lineColor,
              strokeWidth: 2,
              stroke: backgroundColor
            }}
            activeDot={{ 
              r: 7, 
              stroke: lineColor, 
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
}