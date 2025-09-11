'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Step {
  step_number: number;
  target_temperature_c: number;
  ramp_time_minutes: number;
  hold_time_minutes: number;
}

interface FiringProgramEditorProps {
  programId: number | null;
  onSave: (data?: any) => void;
  onCancel: () => void;
  onDelete?: () => void;
  onDeploySuccess?: () => void; // ✅ НОВЫЙ ПРОПС
}

// ✅ Фабрика пустого шага
const createEmptyStep = (index: number): Step => ({
  step_number: index + 1,
  target_temperature_c: 0,
  ramp_time_minutes: 0,
  hold_time_minutes: 0,
});

// ✅ Создаём 5 пустых шагов
const createDefaultSteps = (): Step[] => {
  return Array.from({ length: 5 }, (_, i) => createEmptyStep(i));
};

const FiringProgramEditor: React.FC<FiringProgramEditorProps> = ({ programId, onSave, onCancel, onDelete, onDeploySuccess }) => {
  const [steps, setSteps] = useState<Step[]>(createDefaultSteps());
  const [programName, setProgramName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeploying, setIsDeploying] = useState<{ [key: number]: boolean }>({ 1: false, 2: false, 3: false });

  useEffect(() => {
    const fetchProgram = async () => {
      if (programId !== null) {
        try {
          const res = await fetch(`http://localhost:9090/api/firing-programs/${programId}`);
          if (!res.ok) throw new Error('Failed to fetch program');
          const data = await res.json();
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
        }
      } else {
        setSteps(createDefaultSteps());
        setProgramName('');
      }
    };

    fetchProgram();
  }, [programId]);

  const handleChange = (index: number, key: keyof Step, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [key]: Number(value) };
    setSteps(newSteps);
  };

  const handleSave = () => {
    const stepsWithNumbers = steps.slice(0, 5).map((step, index) => ({
      ...step,
      step_number: index + 1
    }));

    onSave({
      name: programName,
      steps: stepsWithNumbers,
      id: programId
    });
  };

  // ✅ Новая функция: загрузка на устройство
  const handleDeploy = async (deviceProgramId: number) => {
    if (!programId) {
      toast.error('Сначала сохраните программу');
      return;
    }

    setIsDeploying(prev => ({ ...prev, [deviceProgramId]: true }));

    try {
      const res = await fetch(
        `http://localhost:9090/api/firing-programs/${programId}/deploy?deviceProgramId=${deviceProgramId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const text = await res.text(); // Сервер возвращает текст, а не JSON

      if (res.ok) {
        toast.success(`Программа загружена в слот P${deviceProgramId}`);
          if (onDeploySuccess) {
                onDeploySuccess(); // ✅ Вызываем перезагрузку
            }
            
      } else {
        toast.error(`Ошибка: ${text}`);
      }
    } catch (err) {
      console.error('Ошибка сети:', err);
      toast.error('Не удалось подключиться к устройству');
    } finally {
      setIsDeploying(prev => ({ ...prev, [deviceProgramId]: false }));
    }
  };

  return (
    <Card className="h-full flex flex-col border border-border bg-card text-card-foreground shadow-sm">
      <CardContent className="flex-1 p-0 overflow-hidden">
        <CardHeader className="pb-1">
          <CardTitle>{programId === null ? "Создание новой программы" : "Редактирование программы"}</CardTitle>
          <div className="p-4">

            <Input
              id="program-name"
              type="text"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              className="h-8 text-xs border-border bg-background text-foreground"
              placeholder="Введите название"
            />
          </div>
        </CardHeader>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-xs uppercase tracking-wide w-8">Шаг</th>
                <th className="px-3 py-2 text-left font-medium text-xs uppercase tracking-wide">Темп. °C</th>
                <th className="px-3 py-2 text-left font-medium text-xs uppercase tracking-wide">Время роста (мин)</th>
                <th className="px-3 py-2 text-left font-medium text-xs uppercase tracking-wide">Выдержка (мин)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {steps.map((step, index) => (
                <tr key={index} className="hover:bg-muted/50 transition-colors">
                  <td className="px-3 py-2 font-medium text-primary text-center">{index + 1}</td>
                  
                  {/* Температура */}
                  <td className="px-3 py-2">
                    <Input
                      type="text"
                      value={step.target_temperature_c === 0 ? '' : step.target_temperature_c.toString()}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*$/.test(val)) {
                          handleChange(index, 'target_temperature_c', val === '' ? '0' : val);
                        }
                      }}
                      className="h-8 text-xs border-border bg-background text-foreground w-full appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      placeholder="0"
                      inputMode="numeric"
                      pattern="\d*"
                    />
                  </td>

                  {/* Разгон */}
                  <td className="px-3 py-2">
                    <Input
                      type="text"
                      value={step.ramp_time_minutes === 0 ? '' : step.ramp_time_minutes.toString()}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*$/.test(val)) {
                          handleChange(index, 'ramp_time_minutes', val === '' ? '0' : val);
                        }
                      }}
                      className="h-8 text-xs border-border bg-background text-foreground w-full appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      placeholder="0"
                      inputMode="numeric"
                      pattern="\d*"
                    />
                  </td>

                  {/* Удержание */}
                  <td className="px-3 py-2">
                    <Input
                      type="text"
                      value={step.hold_time_minutes === 0 ? '' : step.hold_time_minutes.toString()}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*$/.test(val)) {
                          handleChange(index, 'hold_time_minutes', val === '' ? '0' : val);
                        }
                      }}
                      className="h-8 text-xs border-border bg-background text-foreground w-full appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      placeholder="0"
                      inputMode="numeric"
                      pattern="\d*"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
<CardFooter className="flex flex-col sm:flex-col gap-4 p-4 min-h-[96px]">
  {/* ✅ ВСЕГДА рендерим первую строку, но скрываем, если programId === null */}
  <div
    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3 transition-opacity duration-200 ${
      programId !== null ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
    }`}
  >
    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
      Загрузить на устройство:
    </span>
    <div className="flex flex-wrap items-center gap-2">
      {[1, 2, 3].map((slot) => (
        <TooltipProvider key={slot}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 transition-all hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20"
                onClick={() => handleDeploy(slot)}
                disabled={isDeploying[slot]}
              >
                {isDeploying[slot] ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                <span>П{slot}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-primary text-primary-foreground border-none">
              <p>Загрузить программу в слот Программа '{slot}' устройства</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  </div>

  {/* ✅ Вторая строка: всегда видна */}
  <div className="flex flex-col sm:flex-row sm:justify-end w-full gap-2">
    {programId !== null && onDelete && (
      <Button
        variant="destructive"
        onClick={onDelete}
        className="text-sm"
        disabled={isLoading}
      >
        Удалить
      </Button>
    )}

    <div className="flex gap-2">
      <Button variant="outline" onClick={onCancel} disabled={isLoading} className="text-sm">
        Отмена
      </Button>
      <Button onClick={handleSave} disabled={isLoading} className="text-sm">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Сохранить
      </Button>
    </div>
  </div>
</CardFooter>
    </Card>
  );
};

export default FiringProgramEditor;