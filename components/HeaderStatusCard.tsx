'use client'

import { Card, CardContent } from "./ui/card";
import { useEffect, useState } from 'react';

const HeaderStatusCard = ({ deviceStatus, isRunning, isCritical, statusMap, heaterPower, currentStage, remainingTime }) => {
    // Локальное состояние для температуры
    const [currentTemp, setCurrentTemp] = useState(25); // Значение по умолчанию
    const [tempLoading, setTempLoading] = useState(true); // Показывать ли спиннер

    // Функция для получения температуры
    const fetchTemperature = async () => {
        try {
            setTempLoading(true);
            const response = await fetch('http://localhost:9090/api/runtime/temp');
            if (!response.ok) throw new Error('Failed to fetch temperature');

            const data = await response.json();
            let tempValue = data.temperature;

            // Защита от "космических" значений (временно, пока термопара неисправна)
            if (tempValue > 1 || tempValue < -1400) {
                tempValue = 25; // fallback
            }

            setCurrentTemp(Math.round(tempValue)); // Округляем для читаемости
        } catch (error) {
            console.error('Ошибка получения температуры:', error);
            setCurrentTemp(25); // fallback при ошибке
        } finally {
            setTempLoading(false);
        }
    };

    // Запускаем опрос при монтировании
    useEffect(() => {
        fetchTemperature(); // Первый запрос сразу
        const interval = setInterval(fetchTemperature, 5000); // Затем каждые 5 сек

        return () => clearInterval(interval); // Очистка при размонтировании
    }, []);

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 border-2 border-primary/20 shadow-lg">
            <CardContent className="pt-0 pb-0 px-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            Система обжига Печи
                        </h1>
                        <p className="text-base text-muted-foreground mt-1">
                            Управление и мониторинг в реальном времени
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-muted/40 px-4 py-2.5 rounded-full border border-muted">
                        <div 
                            className={`w-5 h-5 rounded-full ${
                                isRunning ? 'bg-green-500 animate-pulse' : 
                                isCritical ? 'bg-red-500 animate-pulse' : 
                                'bg-primary'
                            } shadow-md`}
                        />
                        <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                            {statusMap[deviceStatus] || deviceStatus}
                        </h2>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
                    {[
                        { 
                            label: "Температура", 
                            value: tempLoading ? (
                                <span className="inline-block animate-pulse">...</span>
                            ) : (
                                `${currentTemp}°C`
                            ), 
                            icon: "🔥" 
                        },
                        { label: "Этап", value: currentStage, icon: "📊" },
                        { label: "Осталось", value: remainingTime, icon: "⏱️" }
                    ].map((item, idx) => (
                        <div 
                            key={idx} 
                            className="bg-gradient-to-br from-muted/80 to-muted/40 p-4 rounded-xl border border-muted/50 
                                       text-center flex flex-col items-center justify-center gap-2 
                                       hover:scale-105 transition-transform duration-300 group"
                        >
                            <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <span className="text-xl group-hover:scale-110 transition-transform duration-300">
                                    {item.icon}
                                </span>
                                {item.label}
                            </div>
                            <div className="text-xl md:text-2xl font-extrabold text-foreground leading-tight">
                                {item.value}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default HeaderStatusCard;