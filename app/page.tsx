'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RecentFiringModal from '@/components/RecentFiringModal';
import StatusBanner from '@/components/StatusBanner';
import HeaderStatusCard from '@/components/HeaderStatusCard';
import TemperatureChartCard from '@/components/TemperatureChartCard'; // Обновлённый!
import QuickActionsCard from '@/components/QuickActionsCard';
import RecentFiringsCard from '@/components/RecentFiringsCard';
import EventLogCard from '@/components/EventLogCard';

const toast = {
    success: (message) => console.log('SUCCESS:', message),
    error: (message) => console.error('ERROR:', message),
};

export default function DashboardPage() {
    const [deviceStatus, setDeviceStatus] = useState("Загрузка...");
    const [currentProgramId, setCurrentProgramId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedFiring, setSelectedFiring] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sessionId, setSessionId] = useState(null); // ID текущей сессии
    const unitId = 16;

    // Телеметрия (только для HeaderStatusCard)
    const [currentTemp, setCurrentTemp] = useState(25);
    const [heaterPower, setHeaterPower] = useState(0);
    const [currentStage, setCurrentStage] = useState("—");
    const [remainingTime, setRemainingTime] = useState("--:--");

    // Последние обжиги — пока заглушка
    const [recentFirings, setRecentFirings] = useState([
        { id: "f1", programId: 2, startTime: "2025-04-01T10:00:00Z", duration: 320, maxTemp: 1280, status: "completed", dataPoints: [] },
        { id: "f2", programId: 1, startTime: "2025-03-30T14:30:00Z", duration: 290, maxTemp: 1260, status: "completed", dataPoints: [] },
        { id: "f3", programId: 3, startTime: "2025-03-28T09:15:00Z", duration: 310, maxTemp: 1300, status: "aborted", dataPoints: [] },
    ]);

    // Лог событий
    const [eventLog, setEventLog] = useState([
        { time: "12:34", message: "Запущена программа #2" },
        { time: "12:40", message: "Достигнута температура 300°C" },
        { time: "13:15", message: "Переход на этап 2" },
    ]);

    const statusMap = {
        "Режим Стоп": "Стоп",
        "Режим Работа": "Работа",
        "Режим Критическая Авария": "Критическая Авария",
        "Программа технолога завершена": "Программа завершена",
        "Режим Автонастройка ПИД-регулятора": "Автонастройка ПИД",
        "Ожидание запуска режима Автонастройка": "Ожидание автонастройки",
        "Автонастройка ПИД-регулятора завершена": "Автонастройка завершена",
        "Режим Настройка": "Настройка",
    };

    const isRunning = deviceStatus === "Режим Работа";
    const isCritical = deviceStatus === "Режим Критическая Авария";

    const fetchStatus = async () => {
        try {
            const statusResponse = await fetch(`http://localhost:9090/api/firing-management/status?unitId=${unitId}`);
            const statusText = await statusResponse.text();
            setDeviceStatus(statusText);
        } catch (error) {
            console.error("Ошибка:", error);
            setDeviceStatus("Ошибка загрузки статуса");
        }
    };

    useEffect(() => {
        fetchStatus();
        const intervalId = setInterval(fetchStatus, 5000);
        return () => clearInterval(intervalId);
    }, []);

    // Обновлённый handleStartStop — теперь он устанавливает sessionId
    const handleStartStop = async () => {
        if (isRunning) {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:9090/api/firing-management/start-stop?start=false&unitId=${unitId}`, {
                    method: 'POST'
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText);
                }
                toast.success("Программа остановлена.");
                setSessionId(null); // Сбрасываем sessionId при остановке
            } catch (error) {
                console.error("Ошибка:", error);
                toast.error(`Ошибка остановки: ${error.message}`);
            } finally {
                setLoading(false);
                fetchStatus();
            }
            return;
        }

        if (!currentProgramId) {
            toast.error("Сначала выберите программу!");
            return;
        }

        setLoading(true);

        try {
            // ШАГ 1: Создать сессию
            let response = await fetch(`http://localhost:9090/api/session?programNumber=${currentProgramId}`, {
                method: 'POST'
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка создания сессии: ${errorText}`);
            }
            const sessionData = await response.json();
            const newSessionId = sessionData.id;
            setSessionId(newSessionId);

            toast.success(`Сессия создана: ID ${newSessionId}`);

            // ШАГ 2: Запустить печь
            response = await fetch(`http://localhost:9090/api/firing-management/start-stop?start=true&unitId=${unitId}`, {
                method: 'POST'
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка запуска печи: ${errorText}`);
            }
            toast.success("Печь запущена.");

            // ШАГ 3: Активировать сессию
            response = await fetch(`http://localhost:9090/api/session/${newSessionId}/start`, {
                method: 'POST'
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка активации сессии: ${errorText}`);
            }
            toast.success("Сессия активирована.");
            fetchStatus();
        } catch (error) {
            console.error("Ошибка запуска:", error);
            toast.error(`Ошибка: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectProgram = async (programNumber) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:9090/api/firing-management/select-program?programNumber=${programNumber}&unitId=${unitId}`, {
                method: 'POST'
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }
            setCurrentProgramId(programNumber);
            toast.success(`Программа #${programNumber} успешно выбрана.`);
        } catch (error) {
            console.error("Ошибка:", error);
            toast.error(`Ошибка выбора программы #${programNumber}: ${error.message}`);
        } finally {
            setLoading(false);
            fetchStatus();
        }
    };

    const openFiringDetails = (firing) => {
        setSelectedFiring(firing);
        setIsModalOpen(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'aborted': return 'bg-yellow-100 text-yellow-800';
            case 'critical_error': return 'bg-red-100 text-red-800';
            default: return 'bg-muted text-foreground';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed': return 'Завершено';
            case 'aborted': return 'Прервано';
            case 'critical_error': return 'Ошибка';
            default: return status;
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-6">
            <StatusBanner isCritical={isCritical} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <HeaderStatusCard 
                    deviceStatus={deviceStatus}
                    isRunning={isRunning}
                    isCritical={isCritical}
                    statusMap={statusMap}
                    currentTemp={currentTemp}
                    heaterPower={heaterPower}
                    currentStage={currentStage}
                    remainingTime={remainingTime}
                />

                {/* Передаём только sessionId и isRunning */}
                <TemperatureChartCard 
                    sessionId={sessionId}
                    isRunning={isRunning}
                />

                <QuickActionsCard 
                    loading={loading}
                    currentProgramId={currentProgramId}
                    handleSelectProgram={handleSelectProgram}
                    handleStartStop={handleStartStop}
                    isRunning={isRunning}
                    isCritical={isCritical}
                />

                <RecentFiringsCard 
                    recentFirings={recentFirings}
                    openFiringDetails={openFiringDetails}
                    getStatusColor={getStatusColor}
                    getStatusText={getStatusText}
                />

                <EventLogCard eventLog={eventLog} />
            </div>

            <RecentFiringModal 
                firing={selectedFiring} 
                open={isModalOpen} 
                onOpenChange={setIsModalOpen} 
            />
        </div>
    );
}