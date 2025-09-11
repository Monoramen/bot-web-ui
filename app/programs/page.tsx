// app/programs/page.tsx

'use client';

import { useState } from 'react';
import { usePrograms } from '@/hooks/usePrograms';
import ProgramList from '@/components/ProgramList';
import FiringProgramTable from '@/components/FiringProgramEditor';
import FiringProgramChart from '@/components/FiringProgramChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DeviceParametersCharts from '@/components/DeviceParametersCharts';
import { toast } from 'react-hot-toast'; // Опционально: для уведомлений

export default function ProgramsPage() {
  const { programs, loading, error, reload, setPrograms } = usePrograms();
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deviceChartsKey, setDeviceChartsKey] = useState(0);

const [selectedProgramVersion, setSelectedProgramVersion] = useState(0);
const handleSaveProgram = async (programData: any) => {
  if (!selectedProgramId && selectedProgramId !== 0) {
    // Создание новой программы
    setIsSaving(true);
    try {
      const res = await fetch('http://localhost:9090/api/firing-programs/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(programData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Server error response:', errorText);
        toast.error(`Ошибка сервера: ${errorText.substring(0, 100)}...`);
        return;
      }

      const newProgram = await res.json();

      // Добавляем новую программу в список
      setPrograms((prev) => [...prev, newProgram]);

      // ✅ Автоматически выбираем созданную программу
      setSelectedProgramId(newProgram.id);

      // ✅ Обновляем версию графика
      setSelectedProgramVersion(prev => prev + 1);

      toast.success('Программа успешно создана!');

      await reload(); // на всякий случай

    } catch (err) {
      toast.error('Ошибка при создании программы');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
    return;
  }

  // Обновление существующей программы (ваш текущий код)
  setIsSaving(true);
  try {
    const res = await fetch(`http://localhost:9090/api/firing-programs/${selectedProgramId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(programData),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Server error response:', errorText);
      toast.error(`Ошибка сервера: ${errorText.substring(0, 100)}...`);
      return;
    }

    const updated = await res.json();

    setPrograms((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );

    toast.success('Программа успешно обновлена!');

    setSelectedProgramVersion(prev => prev + 1);

    await reload();
  } catch (err) {
    toast.error('Ошибка при сохранении программы');
    console.error(err);
  } finally {
    setIsSaving(false);
  }
};

const reloadDeviceCharts = () => {
  console.log('🔄 reloadDeviceCharts вызван! key =', deviceChartsKey + 1);
  setDeviceChartsKey(prev => prev + 1);
};
const handleDeleteProgram = async (programId: number) => {
  if (!confirm('Вы уверены, что хотите удалить программу? Это действие нельзя отменить.')) {
    return;
  }

  try {
    const res = await fetch(`http://localhost:9090/api/firing-programs/${programId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Ошибка при удалении:', errorText);
      toast.error(`Не удалось удалить: ${errorText.substring(0, 100)}...`);
      return;
    }

    // Удаляем из локального состояния
    setPrograms(prev => prev.filter(p => p.id !== programId));

    // Если удаляемая программа выбрана — сбрасываем выбор
    if (selectedProgramId === programId) {
      setSelectedProgramId(null);
    }

    toast.success('Программа удалена');
    await reload(); // на всякий случай

  } catch (err) {
    toast.error('Ошибка при удалении программы');
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
            onDelete={handleDeleteProgram} // ← передаём
          />
        </div>
{/* Средняя колонка: редактор */}
<div className="flex-1 lg:w-1/3 flex flex-col gap-6">

{selectedProgramId !== null ? (
  <FiringProgramTable
    programId={selectedProgramId}
    onSave={handleSaveProgram}
    onDelete={() => handleDeleteProgram(selectedProgramId)} 
    onCancel={() => setSelectedProgramId(null)}
    onDeploySuccess={reloadDeviceCharts}
  />
) : (
  <FiringProgramTable
    programId={null}
    onSave={handleSaveProgram}
    onCancel={() => setSelectedProgramId(null)}
  />
)}
</div>

        {/* Правая колонка: график */}
        <div className="flex-1 lg:w-1/3 flex flex-col gap-6 ">
          <Card className="flex-1 flex flex-col ">
            <CardContent className="flex-1 p-0">
            {selectedProgramId ? (
              <FiringProgramChart 
                key={`chart-${selectedProgramId}-${selectedProgramVersion}`} 
                programId={selectedProgramId} 
                programData={programs.find(p => p.id === selectedProgramId) || null}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Выберите программу для отображения графика</p>
              </div>
            )}
            </CardContent>
          </Card>
        </div>
      </div>

      <br />

      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="flex-1 flex flex-col ">
          <DeviceParametersCharts key={deviceChartsKey} /> {/* ✅ Передаем key */}
        </Card>
      </div>
    </div>
  );
}