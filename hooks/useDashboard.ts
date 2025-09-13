// src/hooks/useDashboard.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiService } from '@/services/apiService';
import { FiringSession } from '@/types/session';

// Мок-тосты (можно вынести в utils/toast.ts)
const toast = {
  success: (message: string) => console.log('SUCCESS:', message),
  error: (message: string) => console.error('ERROR:', message),
};

export const useDashboard = (unitId: number = 16) => {
  const [deviceStatus, setDeviceStatus] = useState("Загрузка...");
  const [currentProgramId, setCurrentProgramId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadingProgram, setLoadingProgram] = useState(false);
  
  // Телеметрия
  const [currentTemp, setCurrentTemp] = useState(25);
  const [heaterPower, setHeaterPower] = useState(0);
  const [currentStage, setCurrentStage] = useState("—");
  const [remainingTime, setRemainingTime] = useState("--:--");

  // Последние обжиги - реальные данные
  const [recentFirings, setRecentFirings] = useState<FiringSession[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);

  // Лог событий
  const [eventLog, setEventLog] = useState([
    { time: "12:34", message: "Запущена программа #2" },
    { time: "12:40", message: "Достигнута температура 300°C" },
    { time: "13:15", message: "Переход на этап 2" },
  ]);

  const isRunning = deviceStatus === "Режим Работа";
  const isCritical = deviceStatus === "Режим Критическая Авария";

  // Маппинг статусов
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

  // useRef для хранения флага обновления
  const isFetchingProgramRef = useRef(false);

  // Загрузка статуса
  const fetchStatus = async () => {
    try {
      const statusText = await ApiService.getStatus(unitId);
      setDeviceStatus(statusText);
    } catch (error) {
      console.error("Ошибка загрузки статуса:", error);
      setDeviceStatus("Ошибка загрузки статуса");
    }
  };

  // Загрузка текущей программы устройства (мемоизированная версия)
  const fetchCurrentProgram = useCallback(async () => {
    if (isFetchingProgramRef.current) return;
    
    isFetchingProgramRef.current = true;
    setLoadingProgram(true);
    
    try {
      const program = await ApiService.getCurrentProgram();
      setCurrentProgramId(program);
    } catch (error) {
      console.error('Ошибка получения текущей программы:', error);
      toast.error('Не удалось получить текущую программу устройства');
    } finally {
      setLoadingProgram(false);
      isFetchingProgramRef.current = false;
    }
  }, []);

  // Загрузка последних обжигов
  const fetchRecentFirings = async () => {
    setIsLoadingRecent(true);
    try {
      const firings = await ApiService.getRecentFirings();
      setRecentFirings(firings);
    } catch (error) {
      console.error("Ошибка загрузки последних обжигов:", error);
      toast.error("Не удалось загрузить историю обжигов");
    } finally {
      setIsLoadingRecent(false);
    }
  };

  // Загрузка текущей температуры
  const fetchCurrentTemperature = async () => {
    try {
      const temperature = await ApiService.getTemperature();
      setCurrentTemp(temperature);
    } catch (error) {
      console.error("Ошибка загрузки температуры:", error);
    }
  };

  // Эффект: загружать статус каждые 5 сек
  useEffect(() => {
    fetchStatus();
    const statusIntervalId = setInterval(fetchStatus, 5000);
    return () => clearInterval(statusIntervalId);
  }, [unitId]);

  // Эффект: загружать текущую программу при монтировании
  useEffect(() => {
    fetchCurrentProgram();
  }, [fetchCurrentProgram]);

  // Эффект: загружать последние обжиги при монтировании
  useEffect(() => {
    fetchRecentFirings();
  }, []);

  // Эффект: загружать температуру для активной сессии
  useEffect(() => {
    if (isRunning) {
      fetchCurrentTemperature();
      const tempIntervalId = setInterval(fetchCurrentTemperature, 3000);
      return () => clearInterval(tempIntervalId);
    }
  }, [isRunning]);

  // Обработчик запуска/остановки
  const handleStartStop = async () => {
    if (isRunning) {
      setLoading(true);
      try {
        await ApiService.startStop(unitId, false);
        toast.success("Программа остановлена.");
        setSessionId(null);
      } catch (error) {
        toast.error(`Ошибка остановки: ${(error as Error).message}`);
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
      // 1. Создать сессию
      const sessionData = await ApiService.createSession(currentProgramId);
      setSessionId(sessionData.id);
      toast.success(`Сессия создана: ID ${sessionData.id}`);

      // 2. Запустить печь
      await ApiService.startStop(unitId, true);
      toast.success("Печь запущена.");

      // 3. Активировать сессию
      await ApiService.activateSession(sessionData.id);
      toast.success("Сессия активирована.");

      // 4. Обновить список обжигов
      fetchRecentFirings();
    } catch (error) {
      toast.error(`Ошибка: ${(error as Error).message}`);
    } finally {
      setLoading(false);
      fetchStatus();
    }
  };

  // Обработчик выбора программы
  const handleSelectProgram = async (programNumber: number) => {
    setLoading(true);
    try {
      await ApiService.selectProgram(unitId, programNumber);
      setCurrentProgramId(programNumber);
      toast.success(`Программа #${programNumber} успешно выбрана.`);
      
      // После выбора программы обновляем статус
      await fetchStatus();
    } catch (error) {
      toast.error(`Ошибка выбора программы #${programNumber}: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // Вспомогательные функции для UI
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'aborted': return 'bg-yellow-100 text-yellow-800';
      case 'critical_error': return 'bg-red-100 text-red-800';
      default: return 'bg-muted text-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Завершено';
      case 'aborted': return 'Прервано';
      case 'critical_error': return 'Ошибка';
      default: return status;
    }
  };

  return {
    // Состояния
    deviceStatus,
    currentProgramId,
    loading: loading || loadingProgram,
    sessionId,
    isRunning,
    isCritical,
    statusMap,
    currentTemp,
    heaterPower,
    currentStage,
    remainingTime,
    recentFirings,
    isLoadingRecent,
    eventLog,

    // Обработчики
    handleStartStop,
    handleSelectProgram,
    fetchCurrentProgram, // возвращаем функцию для ручного обновления
    getStatusColor,
    getStatusText,
  };
};