// src/components/ProgramLoader.tsx
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import DeviceParameterChart from '@/components/program/DeviceParametersChart';
import { useDevicePrograms } from '@/hooks/useDevicePrograms';

interface ProgramLoaderProps {
  onDeploySuccess?: () => void; // ✅ Опциональный пропс для внешнего триггера
}

const ProgramLoader: React.FC<ProgramLoaderProps> = ({ onDeploySuccess }) => {
  const { programs, loading, errors, refetch } = useDevicePrograms();

  // Если передан onDeploySuccess — вызываем refetch при его изменении
  React.useEffect(() => {
    if (onDeploySuccess) {
      const handler = () => {
        console.log('🔄 ProgramLoader: onDeploySuccess вызван — обновляем данные');
        refetch();
      };
      handler();
    }
  }, [onDeploySuccess, refetch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-muted-foreground">Загрузка программ с устройства...</p>
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="col-span-full flex flex-col gap-4 justify-center items-center h-48 text-destructive">
        <p>Не удалось загрузить программы с устройства.</p>
        {Object.entries(errors).map(([id, msg]) => (
          <p key={id} className="text-xs">
            Программа {id}: {msg}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {programs.map((program) => (
        <DeviceParameterChart key={program.id} program={program} />
      ))}

      {[1, 2, 3]
        .filter((id) => !programs.some((p) => p.id === id) && errors[id])
        .map((id) => (
          <Card key={`error-${id}`} className="bg-destructive/10 border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Программа {id}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-destructive">
                Ошибка загрузки: {errors[id]}
              </p>
            </CardContent>
          </Card>
        ))}
    </div>
  );
};

export default ProgramLoader;