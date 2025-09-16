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
import { useState } from 'react';
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
    recentFirings, 
    isLoadingRecent,
    eventLog,
    handleStartStop,
    handleSelectProgram,
    fetchCurrentProgram,
  } = useDashboard(16);

  const [selectedFiring, setSelectedFiring] = useState<FiringSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // В DashboardPage.tsx
  const latestFiring = recentFirings.length > 0 ? recentFirings[0] : null;
  const startTime = latestFiring?.start_time ?? null; // ← добавляем

  // Обновляем displaySessionId при изменении sessionId или recentFirings
  const displaySessionId = sessionId || (latestFiring?.id ? latestFiring.id.toString() : null);

  const openFiringDetails = (firing: FiringSession) => {
    setSelectedFiring(firing);
    setIsModalOpen(true);
  };
  if (deviceStatus === "Устройство не найдено") {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 flex items-center justify-center">
        <div className="text-lg text-red-500">Устройство с ID не найдено.</div>
      </div>
    );
  }
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
        {/* ✅ ВСЁ ПРАВИЛЬНО — теперь с программой и временем */}
        <HeaderStatusCard 
          deviceStatus={deviceStatus}
          isRunning={isRunning}
          isCritical={isCritical}
          statusMap={statusMap}
          currentStage={currentStage}
          program={latestFiring?.program}     // 👈 КЛЮЧЕВОЙ
          startTime={latestFiring?.start_time} // 👈 КЛЮЧЕВОЙ
        />

      <TemperatureChartCard 
        sessionId={displaySessionId}
        isRunning={isRunning}
        startTime={startTime} // 👈 новое свойство
      />

        <QuickActionsCard 
          loading={loading}
          currentProgramId={currentProgramId}
          handleSelectProgram={handleSelectProgram}
          handleStartStop={handleStartStop}
          isRunning={isRunning}
          isCritical={isCritical}
          onRefreshProgram={fetchCurrentProgram}
          refreshing={loading}
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