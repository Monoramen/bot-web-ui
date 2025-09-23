// src/components/dashboard/RecentFiringModal.tsx
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ChartRenderer from "@/components/dashboard/ChartRenderer";
import { useState, useEffect } from "react";
import { FiringSession } from "@/types/session";
import { useFiringChartData } from '@/hooks/useFiringChartData'; // ✅ Используем хук

interface RecentFiringModalProps {
  firing: FiringSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RecentFiringModal = ({ firing, open, onOpenChange }: RecentFiringModalProps) => {
  const chartData = useFiringChartData(firing); // ✅ Вся логика здесь
  const [isDark, setIsDark] = useState(false);

  // Тема — оставляем, это UI-состояние
  useEffect(() => {
    const checkTheme = () => {
      const darkMode = document.documentElement.classList.contains('dark');
      setIsDark(darkMode);
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (!firing) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Обжиг #{firing.id} — Программа {firing.program.id}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <p><strong>Дата:</strong> {new Date(firing.start_time).toLocaleString()}</p>
            <p><strong>Длительность:</strong> {firing.actual_duration_minutes} мин</p>
            <p><strong>Макс. темп.:</strong> {firing.max_recorded_temperature}°C</p>
            <p><strong>Статус:</strong> {firing.status}</p>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold text-lg mb-4">График обжига</h4>
            {chartData.length > 0 ? (
              <ChartRenderer data={chartData} isDark={isDark} />
            ) : (
              <div className="h-64 bg-muted rounded flex items-center justify-center text-sm text-muted-foreground">
                Нет данных для графика
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecentFiringModal;