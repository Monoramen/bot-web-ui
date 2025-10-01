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
import { ClipboardList, ScrollTextIcon } from "lucide-react";

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

  const latestFiring = recentFirings.length > 0 ? recentFirings[0] : null;
  const startTime = latestFiring?.start_time ?? null;
  const displaySessionId = sessionId || (latestFiring?.id ? latestFiring.id.toString() : null);

  const openFiringDetails = (firing: FiringSession) => {
    setSelectedFiring(firing);
    setIsModalOpen(true);
  };

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <HeaderStatusCard
          deviceStatus={deviceStatus}
          isRunning={isRunning}
          isCritical={isCritical}
          statusMap={statusMap}
          currentStage={currentStage}
          program={latestFiring?.program}
          startTime={latestFiring?.start_time}
        />

        <TemperatureChartCard
          sessionId={displaySessionId}
          isRunning={isRunning}
          startTime={startTime}
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
      </div>

      {/* ✅ Обновленная строка: "Последние обжиги" теперь занимает всю ширину в отдельном блоке */}
      <div className="mb-6">
        {/* Обжиги */}
        <div className="h-96 bg-card rounded-lg border-2 border-border/50 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border/50 bg-card/80">
            <div className="flex items-center gap-3 text-xl md:text-2xl font-extrabold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              <ClipboardList className="h-6 w-6 text-primary" />
              Последние обжиги
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <RecentFiringsCard
              openFiringDetails={openFiringDetails}
            />
          </div>
        </div>
      </div>

      {/* Логи (расположены в отдельном полноширинном блоке ниже) */}
      {/* <div className="mb-6">
        <EventLogCard eventLog={eventLog} />
      </div>
      */}

      <RecentFiringModal
        firing={selectedFiring}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
