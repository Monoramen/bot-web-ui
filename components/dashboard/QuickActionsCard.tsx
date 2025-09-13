// components/QuickActionsCard.tsx
'use client'

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { memo } from "react";

interface QuickActionsCardProps {
  loading: boolean;
  currentProgramId: number | null;
  handleSelectProgram: (programNumber: number) => void;
  handleStartStop: () => void;
  isRunning: boolean;
  isCritical: boolean;
  onRefreshProgram?: () => void;
  refreshing?: boolean;
}

const QuickActionsCard = memo(({ 
  loading, 
  currentProgramId, 
  handleSelectProgram, 
  handleStartStop, 
  isRunning, 
  isCritical,
  onRefreshProgram,
  refreshing = false
}: QuickActionsCardProps) => {
  
  return (
    <Card>
      <CardContent className="pt-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Быстрые действия</h2>
          {onRefreshProgram && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshProgram}
              disabled={refreshing || loading}
              className="p-2 h-9 w-9"
              aria-label="Обновить программу"
            >
              <RefreshCw 
                className={`h-4 w-4 transition-transform duration-300 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
          )}
        </div>

        {[1, 2, 3].map((programNumber) => (
          <Button
            key={programNumber}
            onClick={() => handleSelectProgram(programNumber)}
            disabled={loading}
            className={`relative transition-colors duration-300 ${
              currentProgramId === programNumber 
                ? 'border-2 border-primary bg-accent/80' 
                : 'bg-accent hover:bg-accent/80'
            }`}
          >
            Программа {programNumber}
            {currentProgramId === programNumber && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </Button>
        ))}

        <Button 
          onClick={handleStartStop} 
          disabled={loading || isCritical}
          className={`
            mt-4 transition-colors duration-300
            ${isRunning 
              ? "bg-red-500 hover:bg-red-600 text-white" 
              : "bg-primary text-primary-foreground hover:bg-primary/80"
            }
            ${isCritical ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {loading ? "Обработка..." : (isRunning ? "Остановить программу" : "Запустить программу")}
        </Button>
      </CardContent>
    </Card>
  );
});

QuickActionsCard.displayName = "QuickActionsCard";

export default QuickActionsCard;