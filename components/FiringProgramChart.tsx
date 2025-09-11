'use client';
import React, { useState, useEffect, useRef } from 'react';
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

interface Step {
  step_number: number;
  target_temperature_c: number;
  ramp_time_minutes: number;
  hold_time_minutes: number;
}

interface Program {
  id: number;
  name: string;
  steps: Step[];
}

interface FiringProgramChartProps {
  programId: number | null;
  programData?: Program;
}

const programColors = [
  'var(--chart-1)',
  'var(--chart-2)', 
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)'
];

const FiringProgramChart: React.FC<FiringProgramChartProps> = ({ programId, programData }) => {
  const [program, setProgram] = useState<Program | null>(null);
  const [chartData, setChartData] = useState<{ time: number; temperature: number }[]>([]);
  const [isDark, setIsDark] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // ✅ ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ — ВНЕ useEffect
  const generateChartData = (prog: Program) => {
    const chartPoints: { time: number; temperature: number }[] = [];
    let currentTime = 0;

    chartPoints.push({ time: 0, temperature: 0 });

    prog.steps.forEach((step: Step) => {
      if (step.target_temperature_c === 0 && step.ramp_time_minutes === 0) return;

      const lastTemp = chartPoints[chartPoints.length - 1]?.temperature ?? 0;
      chartPoints.push({ time: currentTime, temperature: lastTemp });
      
      currentTime += step.ramp_time_minutes;
      chartPoints.push({ time: currentTime, temperature: step.target_temperature_c });
      
      currentTime += step.hold_time_minutes;
      chartPoints.push({ time: currentTime, temperature: step.target_temperature_c });
    });

    setChartData(chartPoints);
  };

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

  // 👇 Теперь generateChartData доступна здесь
  useEffect(() => {
    if (programData) {
      setProgram(programData);
      generateChartData(programData);
      return;
    }

    if (!programId) {
      setChartData([]);
      setProgram(null);
      return;
    }

    const fetchProgram = async () => {
      try {
        const res = await fetch(`http://localhost:9090/api/firing-programs/${programId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch program');
        }
        const data = await res.json();
        setProgram(data);
        generateChartData(data);
      } catch (error) {
        console.error('Error fetching program:', error);
        setChartData([]);
      }
    };

    fetchProgram();
  }, [programId, programData]);

  if (!programId) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <p className="text-muted-foreground">Выберите программу для отображения графика</p>
      </div>
    );
  }

  if (!program) {
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
    <div className="w-full h-full min-h-[180px] p-2 " ref={chartRef} >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={chartData} 
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id={`colorTemperature${program.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={currentProgramColor} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={currentProgramColor} stopOpacity={0.1}/>
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
              color: textColor
            }}
            labelStyle={{ color: textColor, fontWeight: '600' }}
            formatter={(value) => [`${value}°C`, 'Температура']}
            labelFormatter={(time) => `Время: ${time} мин`}
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
            name={program.name || "Температура"}
            stroke={currentProgramColor}
            strokeWidth={3}
            dot={{ 
              r: 5, 
              fill: currentProgramColor,
              strokeWidth: 2,
              stroke: backgroundColor
            }}
            activeDot={{ 
              r: 7, 
              stroke: currentProgramColor, 
              strokeWidth: 2,
              fill: backgroundColor
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