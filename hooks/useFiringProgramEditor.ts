// src/hooks/useFiringProgramEditor.ts
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ApiService } from '@/services/apiService';
import { ProgramStep, FiringProgram } from '@/types/session';

// ✅ Фабрика пустого шага
const createEmptyStep = (index: number): ProgramStep => ({
  step_number: index + 1,
  target_temperature_c: 0,
  ramp_time_minutes: 0,
  hold_time_minutes: 0,
});

// ✅ Создаём 5 пустых шагов
const createDefaultSteps = (): ProgramStep[] => {
  return Array.from({ length: 5 }, (_, i) => createEmptyStep(i));
};

interface UseFiringProgramEditorProps {
  programId: number | null;
  onSave: (data: Omit<FiringProgram, 'id'> & { id?: number }) => void; // ✅ id опционален
  onCancel: () => void;
  onDelete?: () => void;
  onDeploySuccess?: () => void;
  onFetchFromDevice?: () => void; // ✅ Добавлено
}

export const useFiringProgramEditor = ({
  programId,
  onSave,
  onDeploySuccess,
  onFetchFromDevice, 
}: UseFiringProgramEditorProps) => {
  const [steps, setSteps] = useState<ProgramStep[]>(createDefaultSteps());
  const [programName, setProgramName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeploying, setIsDeploying] = useState<{ [key: number]: boolean }>({ 1: false, 2: false, 3: false });
// Добавь состояние для отслеживания "выгрузки"
  const [isFetchingFromDevice, setIsFetchingFromDevice] = useState<{ [key: number]: boolean }>({ 1: false, 2: false, 3: false });
  // Загрузка программы при изменении programId
  useEffect(() => {
    const fetchProgram = async () => {
      if (programId !== null) {
        try {
          const data = await ApiService.getFiringProgramById(programId);
          setProgramName(data.name || '');

          let loadedSteps = (data.steps || []).slice(0, 5);
          while (loadedSteps.length < 5) {
            loadedSteps.push(createEmptyStep(loadedSteps.length));
          }
          setSteps(loadedSteps);
        } catch (error) {
          console.error('Error fetching program:', error);
          setSteps(createDefaultSteps());
          setProgramName('');
          toast.error('Не удалось загрузить программу');
        }
      } else {
        setSteps(createDefaultSteps());
        setProgramName('');
      }
    };

    fetchProgram();
  }, [programId]);
// Выгрузка программы ИЗ устройства в редактор
const handleFetchFromDevice = async (deviceProgramId: number) => {
  if (onFetchFromDevice) {
  onFetchFromDevice(); // Сбросим programId на уровне страницы
  }
  setIsFetchingFromDevice((prev) => ({ ...prev, [deviceProgramId]: true }));

  try {
    const deviceProgram = await ApiService.getDeviceProgramById(deviceProgramId);

    // Подставляем имя
    setProgramName(deviceProgram.name || `Программа с устройства P${deviceProgramId}`);

    // Подставляем шаги (максимум 5, остальное обрезаем, недостающее заполняем пустыми)
    let loadedSteps = (deviceProgram.steps || []).slice(0, 5);
    while (loadedSteps.length < 5) {
      loadedSteps.push(createEmptyStep(loadedSteps.length));
    }
    setSteps(loadedSteps);

    // Опционально: сбросить selectedProgramId, если мы в режиме создания новой
    // (это нужно на уровне компонента, а не хука — см. ниже)

    toast.success(`Программа загружена из слота P${deviceProgramId}`);
    if (onDeploySuccess) {
      onDeploySuccess(); // Триггерим обновление ProgramLoader
    }
  } catch (err: any) {
    console.error(`Ошибка выгрузки из P${deviceProgramId}:`, err);
    toast.error(`Не удалось выгрузить из P${deviceProgramId}: ${err.message || 'Ошибка связи'}`);
  } finally {
    setIsFetchingFromDevice((prev) => ({ ...prev, [deviceProgramId]: false }));
  }
};
  // Изменение шага
  const handleChange = (index: number, key: keyof ProgramStep, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [key]: Number(value) };
    setSteps(newSteps);
  };

  // Сохранение
  const handleSave = () => {
    const stepsWithNumbers = steps.slice(0, 5).map((step, index) => ({
      ...step,
      step_number: index + 1,
    }));

    onSave({
      name: programName,
      steps: stepsWithNumbers,
      id: programId || undefined,
    });
  };

  // Загрузка на устройство
  const handleDeploy = async (deviceProgramId: number) => {
    if (!programId) {
      toast.error('Сначала сохраните программу');
      return;
    }

    setIsDeploying((prev) => ({ ...prev, [deviceProgramId]: true }));

    try {
      const resultText = await ApiService.deployFiringProgram(programId, deviceProgramId);

      toast.success(`Программа загружена в слот P${deviceProgramId}`);
      if (onDeploySuccess) {
        onDeploySuccess();
      }
    } catch (err: any) {
      console.error('Ошибка сети:', err);
      toast.error(`Ошибка: ${err.message || 'Не удалось подключиться к устройству'}`);
    } finally {
      setIsDeploying((prev) => ({ ...prev, [deviceProgramId]: false }));
    }
  };

  return {
    steps,
    programName,
    setProgramName,
    isLoading,
    isDeploying,
    isFetchingFromDevice, 
    handleChange,
    handleSave,
    handleDeploy,
    handleFetchFromDevice, 
  };
};