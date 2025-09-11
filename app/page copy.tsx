'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TemperatureChart from '@/components/TemperatureChart';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // TODO: Убедись, что установлены
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Для баннера аварии

// Placeholder for a toast function if you don't have one yet
const toast = {
    success: (message) => console.log('SUCCESS:', message),
    error: (message) => console.error('ERROR:', message),
};

// Заглушка для RecentFiringModal — потом замени на реальный компонент
const RecentFiringModal = ({ firing, open, onOpenChange }) => {
    if (!firing) return null;
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Обжиг #{firing.id} — Программа {firing.programId}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p><strong>Дата:</strong> {new Date(firing.startTime).toLocaleString()}</p>
                    <p><strong>Длительность:</strong> {firing.duration} мин</p>
                    <p><strong>Макс. темп.:</strong> {firing.maxTemp}°C</p>
                    <p><strong>Статус:</strong> {firing.status}</p>
                    <div className="mt-4">
                        <h4 className="font-semibold">График обжига</h4>
                        {/* TODO: Вставить TemperatureChart с данными firing.dataPoints */}
                        <div className="h-64 bg-muted rounded flex items-center justify-center text-sm text-muted-foreground">
                            График будет здесь
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default function DashboardPage() {
    const [deviceStatus, setDeviceStatus] = useState("Загрузка...");
    const [currentProgramId, setCurrentProgramId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedFiring, setSelectedFiring] = useState(null); // Для модалки
    const [isModalOpen, setIsModalOpen] = useState(false);
    const unitId = 16;

    // === TODO: Добавить состояния для телеметрии ===
    const [currentTemp, setCurrentTemp] = useState(25); // Заглушка
    const [heaterPower, setHeaterPower] = useState(0);   // Заглушка
    const [currentStage, setCurrentStage] = useState("—"); // Заглушка
    const [remainingTime, setRemainingTime] = useState("--:--"); // Заглушка
    const [tempHistory, setTempHistory] = useState([]); // [{ time: Date.now(), temp: 25 }, ...]
    const [targetProfile, setTargetProfile] = useState([]); // Целевой профиль программы: [{ time: 0, temp: 25 }, { time: 60, temp: 150 }, ...]

    // === TODO: Получать recentFirings из API ===
    const [recentFirings, setRecentFirings] = useState([
        // Заглушка данных
        { id: "f1", programId: 2, startTime: "2025-04-01T10:00:00Z", duration: 320, maxTemp: 1280, status: "completed", dataPoints: [] },
        { id: "f2", programId: 1, startTime: "2025-03-30T14:30:00Z", duration: 290, maxTemp: 1260, status: "completed", dataPoints: [] },
        { id: "f3", programId: 3, startTime: "2025-03-28T09:15:00Z", duration: 310, maxTemp: 1300, status: "aborted", dataPoints: [] },
    ]);

    // === TODO: Лог событий (история этапов, тревог) ===
    const [eventLog, setEventLog] = useState([
        { time: "12:34", message: "Запущена программа #2" },
        { time: "12:40", message: "Достигнута температура 300°C" },
        { time: "13:15", message: "Переход на этап 2" },
    ]);

    // A map to translate status codes to user-friendly text
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

    // === TODO: Расширить fetchStatus — получать телеметрию и программу ===
    const fetchStatus = async () => {
        try {
            const statusResponse = await fetch(`http://localhost:9090/api/firing-management/status?unitId=${unitId}`);
            const statusText = await statusResponse.text();
            setDeviceStatus(statusText);

            // === TODO: Раскомментировать и реализовать ===
            // const telemetry = await fetch(`/api/firing-management/telemetry?unitId=${unitId}`).then(r => r.json());
            // setCurrentTemp(telemetry.currentTemp);
            // setHeaterPower(telemetry.heaterPower);
            // setCurrentStage(telemetry.currentStage);
            // setRemainingTime(telemetry.remainingTimeFormatted);

            // const programResponse = await fetch(`http://localhost:9090/api/program-id?unitId=${unitId}`);
            // const programId = await programResponse.json();
            // setCurrentProgramId(programId);

            // === TODO: Загружать целевой профиль при смене программы ===
            // if (programId) {
            //   const profile = await fetch(`/api/programs/${programId}/profile`).then(r => r.json());
            //   setTargetProfile(profile);
            // }

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

    const handleStartStop = async () => {
        setLoading(true);
        const action = isRunning ? "Остановить" : "Запустить";
        try {
            const response = await fetch(`http://localhost:9090/api/firing-management/start-stop?start=${!isRunning}&unitId=${unitId}`, {
                method: 'POST'
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }
            toast.success(`${action} программу: операция прошла успешно.`);
        } catch (error) {
            console.error("Ошибка:", error);
            toast.error(`${action} программу: ${error.message}`);
        } finally {
            setLoading(false);
            fetchStatus();
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

            // === TODO: Загрузить целевой профиль для этой программы ===
            // const profile = await fetch(`/api/programs/${programNumber}/profile`).then(r => r.json());
            // setTargetProfile(profile);

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
            {/* === КРИТИЧЕСКАЯ АВАРИЯ — БАННЕР НАВЕРХУ === */}
            {isCritical && (
                <Alert variant="destructive" className="mb-6 animate-pulse border-red-500">
                    <AlertTitle>КРИТИЧЕСКАЯ АВАРИЯ!</AlertTitle>
                    <AlertDescription>
                        Немедленно проверьте печь. Работа остановлена.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* === ЗАГОЛОВОК И СТАТУС === */}
              <Card className="col-span-1 md:col-span-2 lg:col-span-3">
                <CardContent className="pt-4 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                    <div>
                      <h1 className="text-xl font-bold">Система обжига Печи</h1>
                      <p className="text-sm text-muted-foreground">Управление и мониторинг в реальном времени</p>
                    </div>

                    {/* Статус справа (на десктопе) */}
                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-md self-start sm:self-auto">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        isRunning ? 'bg-green-500' : 
                        isCritical ? 'bg-red-500' : 
                        'bg-primary'
                      }`} />
                      <span className="text-sm font-medium">
                        {statusMap[deviceStatus] || deviceStatus}
                      </span>
                    </div>
                  </div>

                  {/* Параметры — в одну строку на десктопе, с иконками */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                    {[
                      { label: "Темп.", value: `${currentTemp}°C`, icon: "🌡️" },
                      { label: "Мощн.", value: `${heaterPower}%`, icon: "⚡" },
                      { label: "Этап", value: currentStage, icon: "📊" },
                      { label: "Осталось", value: remainingTime, icon: "⏱️" }
                    ].map((item, idx) => (
                      <div 
                        key={idx} 
                        className="bg-muted/60 p-2.5 rounded-lg text-center flex flex-col items-center justify-center gap-1 min-h-[64px]"
                      >
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <span aria-hidden="true">{item.icon}</span>
                          {item.label}
                        </div>
                        <div className="text-lg font-bold leading-tight">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

                {/* === ГРАФИК ТЕМПЕРАТУРЫ С ЦЕЛЕВЫМ ПРОФИЛЕМ === */}
                <Card className="md:col-span-2">
    
           <h2 className="text-xl font-semibold ">Текущая температура и профиль программы</h2>
              
                    <CardContent className="pt-6">
                        
                        <div className="">
                            <TemperatureChart 
                                data={tempHistory} 
                                targetProfile={targetProfile} // Передаём целевой профиль
                                isRunning={isRunning}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* === БЫСТРЫЕ ДЕЙСТВИЯ === */}
                <Card>
                    <CardContent className="pt-6 flex flex-col gap-4">
                        <h2 className="text-xl font-semibold">Быстрые действия</h2>
                        {[1, 2, 3].map((programNumber) => (
                            <Button
                                key={programNumber}
                                onClick={() => handleSelectProgram(programNumber)}
                                disabled={loading}
                                className={`relative transition-colors duration-300 ${
                                    currentProgramId === programNumber 
                                        ? 'border-2 border-primary bg-accent/80' 
                                        : 'bg-accent hover:bg-accent/80'
                                }`}
                            >
                                Программа {programNumber}
                                {currentProgramId === programNumber && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                )}
                            </Button>
                        ))}

                        <Button 
                            onClick={handleStartStop} 
                            disabled={loading || isCritical}
                            className={`
                                mt-4 transition-colors duration-300
                                ${isRunning 
                                    ? "bg-red-500 hover:bg-red-600 text-white" 
                                    : "bg-primary text-primary-foreground hover:bg-primary/80"
                                }
                                ${isCritical ? "opacity-50 cursor-not-allowed" : ""}
                            `}
                        >
                            {loading ? "Обработка..." : (isRunning ? "Остановить программу" : "Запустить программу")}
                        </Button>
                    </CardContent>
                </Card>

                {/* === ПОСЛЕДНИЕ ОБЖИГИ === */}
                <Card className="md:col-span-2 lg:col-span-3">
                    <CardContent className="pt-6">
                        <h2 className="text-xl font-semibold mb-4">Последние обжиги</h2>
                        <div className="space-y-3">
                            {recentFirings.map(firing => (
                                <div 
                                    key={firing.id} 
                                    className="p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                                    onClick={() => openFiringDetails(firing)}
                                >
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                        <div>
                                            <span className="font-medium">Программа #{firing.programId}</span>
                                            <span className="mx-2">•</span>
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(firing.startTime).toLocaleDateString()} в {new Date(firing.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm">Длит.: {firing.duration} мин</span>
                                            <span className="text-sm">Макс: {firing.maxTemp}°C</span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(firing.status)}`}>
                                                {getStatusText(firing.status)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* === ЛОГ СОБЫТИЙ === */}
                <Card className="lg:col-span-3">
                    <CardContent className="pt-6">
                        <h2 className="text-xl font-semibold mb-4">Лог событий</h2>
                        <div className="space-y-2 max-h-40 overflow-y-auto text-sm">
                            {eventLog.map((event, idx) => (
                                <div key={idx} className="flex gap-4 py-1 border-b last:border-b-0">
                                    <span className="text-muted-foreground w-16">{event.time}</span>
                                    <span>{event.message}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* === МОДАЛЬНОЕ ОКНО ДЕТАЛЕЙ ОБЖИГА === */}
            <RecentFiringModal 
                firing={selectedFiring} 
                open={isModalOpen} 
                onOpenChange={setIsModalOpen} 
            />
        </div>
    );
}