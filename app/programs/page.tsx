// app/programs/page.tsx
'use client';

import { useState } from 'react';
import { usePrograms } from '@/hooks/usePrograms';
import ProgramList from '@/components/program/ProgramList';
import FiringProgramTable from '@/components/program/FiringProgramEditor';
import FiringProgramChart from '@/components/program/FiringProgramChart';
import { Card } from '@/components/ui/card';
import ProgramLoader from '@/components/program/ProgramLoader'; // ✅ Импортируем новый компонент
import { toast } from 'react-hot-toast';
import { ApiService } from '@/services/apiService';
import { FiringProgram } from '@/types/session';

export default function ProgramsPage() {
  const { programs, loading, error, reload, setPrograms } = usePrograms();
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);

  // ❌ Удаляем: const [deviceChartsKey, setDeviceChartsKey] = useState(0);
  const [selectedProgramVersion, setSelectedProgramVersion] = useState(0);

const handleSaveProgram = async (
  programData: Omit<FiringProgram, 'id'> & { id?: number }
) => {
  

    try {
          let updatedProgram: FiringProgram;

          if (programData.id === undefined || programData.id === null) {
            // Создание новой программы
            updatedProgram = await ApiService.createFiringProgram(programData);
          } else {
            // Обновление существующей
            updatedProgram = await ApiService.updateFiringProgram(programData.id, programData);
          }

          // Теперь обновляем состояние
          if (selectedProgramId === null || selectedProgramId === undefined) {
            // Новая программа
            setPrograms((prev) => [...prev, updatedProgram]);
            setSelectedProgramId(updatedProgram.id);
            toast.success('Программа успешно создана!');
          } else {
            // Существующая программа
            setPrograms((prev) =>
              prev.map((p) => (p.id === updatedProgram.id ? updatedProgram : p))
            );
            toast.success('Программа успешно обновлена!');
          }

          setSelectedProgramVersion((prev) => prev + 1);
          await reload();
    } catch (err) {
        let errorMessage = 'Неизвестная ошибка';
        if (err instanceof Error) {
           errorMessage = err.message;
          } else if (typeof err === 'string') {
      errorMessage = err;
  }

  toast.error(`Ошибка: ${errorMessage}`);
  console.error(err);
}
  };



  const handleDeleteProgram = async (programId: number) => {
    if (
      !confirm('Вы уверены, что хотите удалить программу? Это действие нельзя отменить.')
    ) {
      return;
    }

    try {
      await ApiService.deleteFiringProgram(programId);
      setPrograms((prev) => prev.filter((p) => p.id !== programId));
      if (selectedProgramId === programId) {
        setSelectedProgramId(null);
      }
      toast.success('Программа удалена');
      await reload();
    } catch (err) {
  let errorMessage = 'Неизвестная ошибка';
  if (err instanceof Error) {
    errorMessage = err.message;
  } else if (typeof err === 'string') {
    errorMessage = err;
  }

  toast.error(`Ошибка: ${errorMessage}`);
  console.error(err);
}
  };

  return (
    <div className="p-2 md:p-0">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Левая колонка: список программ */}
        <div className="flex-1 lg:w-1/3 flex flex-col gap-6">
          {loading && <p>Загрузка программ...</p>}
          {error && <p className="text-red-500">{error}</p>}
          <ProgramList
            programs={programs}
            selectedProgramId={selectedProgramId}
            onSelect={setSelectedProgramId}
            onAdd={() => setSelectedProgramId(null)}
            onDelete={handleDeleteProgram}
          />
        </div>

        {/* Средняя колонка: редактор */}
        <div className="flex-1 lg:w-1/3 flex flex-col gap-6">
<FiringProgramTable
  programId={selectedProgramId}
  onSave={(data) => {
    if (data) {
      handleSaveProgram(data);
    }
  }}
  onDelete={
    selectedProgramId !== null
      ? () => handleDeleteProgram(selectedProgramId)
      : undefined
  }
  onCancel={() => setSelectedProgramId(null)}
  onDeploySuccess={() => {
    console.log('✅ onDeploySuccess вызван — ProgramLoader обновит данные');
  }}
  onFetchFromDevice={() => setSelectedProgramId(null)} // ✅ Это сбросит программу → "режим создания"
/>
        </div>

        {/* Правая колонка: график */}
        <div className="flex-1 lg:w-1/3 flex flex-col gap-6">
          <Card className="flex-1 flex flex-col">
            {/* Убираем CardContent, если он не нужен */}
            {selectedProgramId ? (
              <FiringProgramChart
                key={`chart-${selectedProgramId}-${selectedProgramVersion}`}
                programId={selectedProgramId}
                programData={programs.find((p) => p.id === selectedProgramId) || null}
              />
            ) : (
              <div className="flex p-10 items-center justify-center h-full">
                <p className="text-gray-500">Выберите программу для отображения графика</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      <br />

      {/* ✅ Заменяем DeviceParametersCharts на ProgramLoader */}
      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="flex-1 flex flex-col p-4">
          <ProgramLoader />
        </Card>
      </div>
    </div>
  );
}