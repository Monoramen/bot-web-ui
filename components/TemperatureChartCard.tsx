'use client'

import { Card, CardContent } from "@/components/ui/card";
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

const TemperatureChartCard = ({ sessionId, isRunning }) => {
    const [chartData, setChartData] = useState([]); // ✅ Один массив для всех данных
    const [isDark, setIsDark] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
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

    // Форматирование времени для графика
    const formatTime = (timestamp) => {
        if (!timestamp) return "—";
        const date = new Date(timestamp);
        return date.toTimeString().slice(0, 5); // "HH:MM"
    };

    // Загрузка данных сессии
    const loadSessionData = async (id) => {
        if (!id) return;

        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:9090/api/session?sessionId=${id}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

            const session = await response.json();
            console.log('📊 Получены данные сессии:', session);

            // Реальные данные температуры
            const realData = session.temperature_readings?.map(r => ({
                time: formatTime(r.timestamp),
                temperature: typeof r.temperature === 'number' && !isNaN(r.temperature)
                    ? r.temperature
                    : 0
            })) || [];

            console.log('📈 Реальные данные:', realData);

            // Целевой профиль
            let profileData = [];
            if (session.program?.steps && session.start_time) {
                const startTime = new Date(session.start_time);
                let currentTime = 0;

                session.program.steps.forEach(step => {
                    if (step.step_number === 5) return;

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

            console.log('🎯 Целевой профиль:', profileData);

            // ✅ ОБЪЕДИНЯЕМ ДАННЫЕ — ключевой момент!
            const mergedData = mergeChartData(realData, profileData);
            console.log('🔄 Объединённые данные:', mergedData);

            setChartData(mergedData);
        } catch (error) {
            console.error("❌ Ошибка загрузки данных сессии:", error);
            setChartData([]);
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Функция объединения данных по времени
    const mergeChartData = (realData, profileData) => {
        const timeMap = new Map();

        // Добавляем все точки из реальных данных
        realData.forEach(point => {
            timeMap.set(point.time, { ...point });
        });

        // Добавляем/обновляем точки из целевого профиля
        profileData.forEach(point => {
            if (timeMap.has(point.time)) {
                timeMap.set(point.time, { ...timeMap.get(point.time), ...point });
            } else {
                timeMap.set(point.time, { ...point });
            }
        });

        // Преобразуем в массив и сортируем по времени (опционально)
        return Array.from(timeMap.values()).sort((a, b) => {
            const [aH, aM] = a.time.split(':').map(Number);
            const [bH, bM] = b.time.split(':').map(Number);
            return aH * 60 + aM - (bH * 60 + bM);
        });
    };

    // Автообновление
    useEffect(() => {
        if (sessionId) {
            loadSessionData(sessionId);
            const interval = setInterval(() => loadSessionData(sessionId), 5000);
            return () => clearInterval(interval);
        } else {
            setChartData([]);
        }
    }, [sessionId, isRunning]);

    // Цвета темы
    const gridColor = isDark ? '#8C3F2840' : '#E3C5A060';
    const axisColor = isDark ? '#8C3F28' : '#E3C5A0';
    const textColor = isDark ? '#F5E3D0' : '#1C1C1C';
    const backgroundColor = isDark ? '#3A2B20' : '#F5E3D0';
    const realLineColor = isDark ? '#F0A975' : '#D17A4C';
    const targetLineColor = isDark ? '#75B0F0' : '#4C7AD1';

    return (
        <Card className="md:col-span-2">
            <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Текущая температура и профиль программы</h2>
                
                {isLoading && (
                    <div className="text-center py-4 text-muted-foreground">
                        Загрузка данных сессии...
                    </div>
                )}

                {!sessionId && (
                    <div className="text-center py-8 text-muted-foreground">
                        Выберите программу и запустите обжиг
                    </div>
                )}

                {sessionId && !isLoading && chartData.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        Нет данных для отображения
                    </div>
                )}

                {chartData.length > 0 && (
                    <div className="w-full h-[400px] rounded-lg p-4 border border-border bg-card shadow-sm" ref={chartRef}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart 
                                data={chartData} // ✅ Передаём ОБЪЕДИНЁННЫЕ данные
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
                                
                                {/* Целевая линия */}
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
                                
                                {/* Реальная линия */}
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
                )}
            </CardContent>
        </Card>
    );
};

export default TemperatureChartCard;