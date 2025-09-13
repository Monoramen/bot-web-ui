// src/components/dashboard/RecentFiringModal.tsx
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ChartRenderer from "@/components/dashboard/ChartRenderer";
import { useState, useEffect } from "react";    
import { FiringSession } from "@/types/session";

interface RecentFiringModalProps {
  firing: FiringSession | null; // может быть null, судя по логике `if (!firing) return null`
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
interface ChartPoint {
  time: string;
  temperature?: number;
  targetTemp?: number;
}

const RecentFiringModal = ({ firing, open, onOpenChange }: RecentFiringModalProps) => {
    const [chartData, setChartData] = useState<{ time: string; temperature?: number; targetTemp?: number }[]>([]);
    const [isDark, setIsDark] = useState(false);

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
    const formatTime = (timestamp: string | number | Date | null | undefined) => {
        if (!timestamp) return "—";
        const date = new Date(timestamp);
        return date.toTimeString().slice(0, 5);
    };

    // Объединение данных
// Объединение данных
const mergeChartData = (realData: ChartPoint[], profileData: ChartPoint[]) => {
    const timeMap = new Map<string, ChartPoint>();

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
        const realData: ChartPoint[] = firing.temperature_readings?.map(r => ({
            time: formatTime(r.timestamp),
            temperature: typeof r.temperature === 'number' && !isNaN(r.temperature)
                ? r.temperature
                : 0
        })) || [];

        // Целевой профиль
// Целевой профиль
            const profileData: ChartPoint[] = []; // ✅ Явно указываем тип
            if (firing.program?.steps && firing.start_time) {
                const startTime = new Date(firing.start_time);
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

    if (!firing) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Обжиг #{firing.id} — Программа {firing.program.id}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <p><strong>Дата:</strong> {new Date(firing.start_time).toLocaleString()}</p>
                        <p><strong>Длительность:</strong> {firing.actual_duration_minutes} мин</p>
                        <p><strong>Макс. темп.:</strong> {firing.max_recorded_temperature}°C</p>
                        <p><strong>Статус:</strong> {firing.status}</p>
                    </div>

                    <div className="mt-6">
                        <h4 className="font-semibold text-lg mb-4">График обжига</h4>
                        {chartData.length > 0 ? (
                            <ChartRenderer data={chartData} isDark={isDark} />  
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