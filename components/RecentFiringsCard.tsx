'use client'

import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from 'react';

const RecentFiringsCard = ({ openFiringDetails }) => {
    const [recentFirings, setRecentFirings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Маппинг статусов: из enum-имён → человекочитаемые короткие + цвета
    const statusConfig = {
        STOPPED: { label: "Остановлен", color: "bg-gray-100 text-gray-800" },
        RUNNING: { label: "В работе", color: "bg-blue-100 text-blue-800" },
        CRITICAL_ERROR: { label: "Авария!", color: "bg-red-100 text-red-800 animate-pulse" },
        PROGRAM_COMPLETED: { label: "Завершён", color: "bg-green-100 text-green-800 font-medium" },
        PID_AUTOTUNE_RUNNING: { label: "Автонастройка", color: "bg-purple-100 text-purple-800" },
        PID_AUTOTUNE_WAITING: { label: "Ожидание", color: "bg-yellow-100 text-yellow-800" },
        PID_AUTOTUNE_COMPLETED: { label: "Настроено", color: "bg-indigo-100 text-indigo-800" },
        SETTINGS: { label: "Настройка", color: "bg-orange-100 text-orange-800" },
        UNKNOWN: { label: "Неизвестно", color: "bg-muted text-foreground" }
    };

    // Функция получения статуса
    const getStatusDisplay = (statusKey) => {
        return statusConfig[statusKey] || statusConfig.UNKNOWN;
    };

    // Загрузка данных
    const fetchRecentFirings = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:9090/api/session/recent');
            if (!response.ok) throw new Error('Failed to fetch recent firings');

            const data = await response.json();

            const formatted = data.map(session => ({
                id: session.id,
                programId: session.program?.id || 0,
                startTime: session.start_time,
                duration: session.actual_duration_minutes || 0,
                maxTemp: session.max_recorded_temperature 
                    ? parseFloat(session.max_recorded_temperature.toFixed(1)) 
                    : 0,
                status: session.status || 'UNKNOWN', // ← ключ статуса из API
                program: session.program,
                temperature_readings: session.temperature_readings
            }));

            setRecentFirings(formatted);
        } catch (err) {
            console.error('Ошибка загрузки последних обжигов:', err);
            setError('Не удалось загрузить данные');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecentFirings();
    }, []);

    return (
        <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Последние обжиги</h2>
                
                {loading ? (
                    <div className="py-8 text-center text-muted-foreground">
                        Загрузка...
                    </div>
                ) : error ? (
                    <div className="py-8 text-center text-red-500">
                        {error}
                    </div>
                ) : recentFirings.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        Нет завершённых обжигов
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentFirings.map(firing => {
                            const statusDisplay = getStatusDisplay(firing.status);
                            return (
                                <div 
                                    key={firing.id} 
                                    className="p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                                    onClick={() => openFiringDetails(firing)}
                                >
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                        <div>
                                            <span className="font-medium">Обжиг #{firing.programId}</span>
                                            <span className="mx-2">•</span>
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(firing.startTime).toLocaleDateString()} в {new Date(firing.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm">Длит.: {firing.duration} мин</span>
                                            <span className="text-sm">Макс: {firing.maxTemp}°C</span>
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${statusDisplay.color}`}>
                                                {statusDisplay.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default RecentFiringsCard;