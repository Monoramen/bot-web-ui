// src/components/FiringProgramEditor.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, Download } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFiringProgramEditor } from '@/hooks/useFiringProgramEditor';
import { FiringProgram } from '@/types/session';

interface FiringProgramEditorProps {
  programId: number | null;
  onSave: (data: Omit<FiringProgram, 'id'> & { id?: number }) => void;
  onCancel: () => void;
  onDelete?: () => void;
  onDeploySuccess?: () => void;
  onFetchFromDevice?: () => void; // ✅ Добавлено
}

// ... импорты остались без изменений

const FiringProgramEditor: React.FC<FiringProgramEditorProps> = ({
  programId,
  onSave,
  onCancel,
  onDelete,
  onDeploySuccess,
}) => {
  const {
    steps,
    programName,
    setProgramName,
    isLoading,
    isDeploying,
    isFetchingFromDevice,
    handleChange,
    handleSave,
    handleDeploy,
    handleFetchFromDevice
  } = useFiringProgramEditor({
    programId,
    onSave,
    onDeploySuccess,
    onCancel,
    onDelete,
    
  });

  return (
    <Card className="h-full flex flex-col border border-border bg-card text-card-foreground shadow-sm">
      <CardContent className="flex-1 p-0 overflow-hidden">
        <CardHeader className="pb-1">
          <CardTitle>
            {programId === null ? 'Создание новой программы' : 'Редактирование программы'}
          </CardTitle>
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
                <th className="px-3 py-2 text-left font-medium text-xs uppercase tracking-wide w-8">
                  Шаг
                </th>
                <th className="px-3 py-2 text-left font-medium text-xs uppercase tracking-wide">
                  Темп. °C
                </th>
                <th className="px-3 py-2 text-left font-medium text-xs uppercase tracking-wide">
                  Время роста (мин)
                </th>
                <th className="px-3 py-2 text-left font-medium text-xs uppercase tracking-wide">
                  Выдержка (мин)
                </th>
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



          {/* Выгрузка из устройства (Download) */}
<div className="flex flex-wrap items-center gap-2 w-full pt-2">
  {/* Группа: Выгрузка из ПУ */}
  <div className="flex items-center gap-1">
    <Download className="h-3.5 w-3.5 text-muted-foreground" />
    <span className="text-xs text-muted-foreground">ВЫГРУЗИТЬ:</span>
  </div>
  {[1, 2, 3].map((slot) => (
    <TooltipProvider key={`fetch-${slot}`}>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 px-1.5 h-7 text-[10px] transition-all hover:bg-secondary/80 hover:text-secondary-foreground"
            onClick={() => handleFetchFromDevice(slot)}
            disabled={isFetchingFromDevice[slot]}
          >
            {isFetchingFromDevice[slot] ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Download className="h-3 w-3" />
            )}
            <span>П{slot}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-secondary text-secondary-foreground border-none text-xs">
          <p>Выгрузить из слота П{slot}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ))}

  {/* Разделитель */}
  <div className="w-px h-6 bg-border/50 mx-2"></div>

  {/* Группа: Загрузка в ПУ */}
  <div className="flex items-center gap-1">
    <Upload className="h-3.5 w-3.5 text-muted-foreground" />
    <span className="text-xs text-muted-foreground">ЗАГРУЗИТЬ:</span>
  </div>
  {[1, 2, 3].map((slot) => (
    <TooltipProvider key={`deploy-${slot}`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 px-1.5 h-7 text-[10px] transition-all hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20"
            onClick={() => handleDeploy(slot)}
            disabled={isDeploying[slot]}
          >
            {isDeploying[slot] ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Upload className="h-3 w-3" />
            )}
            <span>П{slot}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-primary text-primary-foreground border-none text-xs">
          <p>Загрузить в слот П{slot}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ))}
</div>
        {/* ✅ ВТОРАЯ СТРОКА: всегда видна — действия сохранения/удаления */}
        <div className="flex flex-col sm:flex-row sm:justify-end w-full gap-2">
          {programId !== null && onDelete && (
            <Button variant="destructive" onClick={onDelete} className="text-sm" disabled={isLoading}>
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

