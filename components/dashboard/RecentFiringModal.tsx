// src/components/dashboard/RecentFiringModal.tsx
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ChartRenderer from "@/components/dashboard/ChartRenderer";
import { useState, useEffect } from "react";
import { FiringSession, ChartDataPoint } from "@/types/session"; // Добавлен ChartDataPoint
import { generateProgramProfile } from '@/utils/programProfileGenerator'; // Импортируем вашу функцию
import { generateChartData } from '@/utils/chartDataGenerator'; // ✅ Добавьте этот импорт
interface RecentFiringModalProps {
    firing: FiringSession | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// ChartPoint теперь не нужен, так как ChartDataPoint уже определен
// interface ChartPoint {
//     time: string;
//     temperature?: number;
//     targetTemp?: number;
// }

const RecentFiringModal = ({ firing, open, onOpenChange }: RecentFiringModalProps) => {
    // Используем ChartDataPoint[] для состояния chartData
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
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

    // Форматирование времени - теперь только для реальных показаний
const formatTimeFromStart = (timestamp: string | number | Date | null | undefined, startTime: string | null) => {
    if (!timestamp || !startTime) return "—";

    const start = new Date(startTime);
    const current = new Date(timestamp);
    const elapsedMinutes = Math.floor((current.getTime() - start.getTime()) / 60000);

    return minutesToTimeString(elapsedMinutes);
};
const minutesToTimeString = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};
    // Объединение данных - теперь принимает ChartDataPoint[]
// Replace the mergeChartData function in RecentFiringModal.tsx with this version
const mergeChartData = (realData: ChartDataPoint[], profileData: ChartDataPoint[]) => {
    // 1. Create a map with all profile data points
    const timeMap = new Map<string, ChartDataPoint>();
    profileData.forEach(point => {
        timeMap.set(point.time, { ...point });
    });

    // 2. Iterate through real data and merge with profile data
    realData.forEach(point => {
        const existing = timeMap.get(point.time);
        if (existing) {
            // If the time already exists in the profile, merge the real temperature
            timeMap.set(point.time, { ...existing, temperature: point.temperature });
        } else {
            // If the time is only in the real data, add a new point
            timeMap.set(point.time, {
                time: point.time,
                temperature: point.temperature,
                targetTemp: undefined // No target for this point
            });
        }
    });

    // 3. Convert the map back to a sorted array
    const mergedAndSorted = Array.from(timeMap.values()).sort((a, b) => {
        const [aH, aM] = a.time.split(':').map(Number);
        const [bH, bM] = b.time.split(':').map(Number);
        return aH * 60 + aM - (bH * 60 + bM);
    });

    return mergedAndSorted;
};

// RecentFiringModal.tsx
useEffect(() => {
    if (!firing) {
        setChartData([]);
        return;
    }

    const startTime = firing.start_time;

    // 1. Реальные данные — теперь с правильным форматом времени
    const realData: ChartDataPoint[] = firing.temperature_readings?.map(r => ({
        time: formatTimeFromStart(r.timestamp, startTime),
        temperature: typeof r.temperature === 'number' && !isNaN(r.temperature)
            ? r.temperature
            : undefined,
        targetTemp: undefined,
    })) || [];

    // 2. Профиль — генерируется по минутам, поэтому совпадает с форматом
    let profileData: ChartDataPoint[] = [];
    if (firing.program) {
        profileData = generateProgramProfile(firing.program);
    }

    // 3. Объединяем данные
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