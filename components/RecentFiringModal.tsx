'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { useState, useEffect, useRef } from "react";

const RecentFiringModal = ({ firing, open, onOpenChange }) => {
    const [chartData, setChartData] = useState([]);
    const [isDark, setIsDark] = useState(false);
    const chartRef = useRef(null);

    // Отслеживаем тему
    useEffect(() => {
        const checkTheme = () => {
            const darkMode = document.documentElement.classList.contains('dark');
            setIsDark(darkMode);
        };
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // Форматирование времени
    const formatTime = (timestamp) => {
        if (!timestamp) return "—";
        const date = new Date(timestamp);
        return date.toTimeString().slice(0, 5);
    };

    // Объединение данных
    const mergeChartData = (realData, profileData) => {
        const timeMap = new Map();

        realData.forEach(point => {
            timeMap.set(point.time, { ...point });
        });

        profileData.forEach(point => {
            if (timeMap.has(point.time)) {
                timeMap.set(point.time, { ...timeMap.get(point.time), ...point });
            } else {
                timeMap.set(point.time, { ...point });
            }
        });

        return Array.from(timeMap.values()).sort((a, b) => {
            const [aH, aM] = a.time.split(':').map(Number);
            const [bH, bM] = b.time.split(':').map(Number);
            return aH * 60 + aM - (bH * 60 + bM);
        });
    };

    // Построение данных при изменении firing
    useEffect(() => {
        if (!firing) {
            setChartData([]);
            return;
        }

        // Реальные данные
        const realData = firing.temperature_readings?.map(r => ({
            time: formatTime(r.timestamp),
            temperature: typeof r.temperature === 'number' && !isNaN(r.temperature)
                ? r.temperature
                : 0
        })) || [];

        // Целевой профиль
        let profileData = [];
        if (firing.program?.steps && firing.startTime) {
            const startTime = new Date(firing.startTime);
            let currentTime = 0;

            firing.program.steps.forEach(step => {
                if (step.step_number === 5) return; // игнорируем охлаждение

                const timeAtStart = new Date(startTime.getTime() + currentTime * 60000);
                profileData.push({
                    time: formatTime(timeAtStart.toISOString()),
                    targetTemp: step.target_temperature_c
                });

                currentTime += step.ramp_time_minutes + step.hold_time_minutes;
                const timeAtEnd = new Date(startTime.getTime() + currentTime * 60000);
                profileData.push({
                    time: formatTime(timeAtEnd.toISOString()),
                    targetTemp: step.target_temperature_c
                });
            });
        }

        // Объединяем
        const merged = mergeChartData(realData, profileData);
        setChartData(merged);
    }, [firing]);

    // Цвета темы
    const gridColor = isDark ? '#8C3F2840' : '#E3C5A060';
    const axisColor = isDark ? '#8C3F28' : '#E3C5A0';
    const textColor = isDark ? '#F5E3D0' : '#1C1C1C';
    const backgroundColor = isDark ? '#3A2B20' : '#F5E3D0';
    const realLineColor = isDark ? '#F0A975' : '#D17A4C';
    const targetLineColor = isDark ? '#75B0F0' : '#4C7AD1';

    if (!firing) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Обжиг #{firing.id} — Программа {firing.programId}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <p><strong>Дата:</strong> {new Date(firing.startTime).toLocaleString()}</p>
                        <p><strong>Длительность:</strong> {firing.duration} мин</p>
                        <p><strong>Макс. темп.:</strong> {firing.maxTemp}°C</p>
                        <p><strong>Статус:</strong> {firing.status}</p>
                    </div>

                    <div className="mt-6">
                        <h4 className="font-semibold text-lg mb-4">График обжига</h4>
                        {chartData.length > 0 ? (
                            <div className="w-full h-[400px] rounded-lg p-4 border border-border bg-card shadow-sm" ref={chartRef}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart 
                                        data={chartData}
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
                                            formatter={(value, name) => [`${value}°C`, name]}
                                            labelFormatter={(time) => `Время: ${time}`}
                                        />
                                        
                                        <Legend 
                                            wrapperStyle={{ color: textColor, fontSize: '12px' }} 
                                            align="center"
                                            verticalAlign="top"
                                            height={36}
                                        />
                                        
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
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 bg-muted rounded flex items-center justify-center text-sm text-muted-foreground">
                                Нет данных для графика
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default RecentFiringModal;