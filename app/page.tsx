// src/app/dashboard/page.tsx
'use client';

import RecentFiringModal from '@/components/dashboard/RecentFiringModal';
import StatusBanner from '@/components/dashboard/StatusBanner';
import HeaderStatusCard from '@/components/dashboard/HeaderStatusCard';
import TemperatureChartCard from '@/components/dashboard/TemperatureChartCard';
import QuickActionsCard from '@/components/dashboard/QuickActionsCard';
import RecentFiringsCard from '@/components/dashboard/RecentFiringsCard';
import EventLogCard from '@/components/dashboard/EventLogCard';
import { useDashboard } from '@/hooks/useDashboard';
import { useState, useEffect } from 'react';
import { FiringSession } from '@/types/session';

export default function DashboardPage() {
  const {
    deviceStatus,
    currentProgramId,
    loading,
    sessionId,
    isRunning,
    isCritical,
    statusMap,
    currentStage,
    remainingTime,
    recentFirings,
    isLoadingRecent,
    eventLog,
    handleStartStop,
    handleSelectProgram,
    fetchCurrentProgram,
  } = useDashboard(16);

  const [displaySessionId, setDisplaySessionId] = useState<string | null>(null);
  const [selectedFiring, setSelectedFiring] = useState<FiringSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Функция для валидации ID сессии
  const getValidSessionId = (id: number): string | null => {
    if (id === null || id === undefined) return null;
    const numericId = Number(id);
    return isNaN(numericId) ? null : numericId.toString();
  };

  // Обновляем displaySessionId при изменении sessionId или recentFirings
  useEffect(() => {
    if (sessionId) {
      setDisplaySessionId(sessionId);
    } else if (!isLoadingRecent && recentFirings.length > 0) {
      const validId = getValidSessionId(recentFirings[0].id);
      setDisplaySessionId(validId);
    } else {
      setDisplaySessionId(null);
    }
  }, [sessionId, recentFirings, isLoadingRecent]);

  const openFiringDetails = (firing: FiringSession) => {
    setSelectedFiring(firing);
    setIsModalOpen(true);
  };

  // Показываем лоадер пока загружаются данные
  if (isLoadingRecent) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 flex items-center justify-center">
        <div className="text-lg">Загрузка данных...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <StatusBanner isCritical={isCritical} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <HeaderStatusCard 
          deviceStatus={deviceStatus}
          isRunning={isRunning}
          isCritical={isCritical}
          statusMap={statusMap}
          currentStage={currentStage}
          remainingTime={remainingTime}
        />

        <TemperatureChartCard 
          sessionId={displaySessionId}
          isRunning={isRunning}
        />

       <QuickActionsCard 
          loading={loading}
          currentProgramId={currentProgramId}
          handleSelectProgram={handleSelectProgram}
          handleStartStop={handleStartStop}
          isRunning={isRunning}
          isCritical={isCritical}
          onRefreshProgram={fetchCurrentProgram} // передаем функцию обновления
          refreshing={loading} // используем общее состояние загрузки
        />

        <RecentFiringsCard 
          openFiringDetails={openFiringDetails}
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