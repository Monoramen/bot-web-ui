import { FiringSession } from '@/types/session';
import { getStatusDisplay } from '@/constants/statusConfig';

interface FiringItemProps {
  firing: FiringSession;
  onClick: () => void;
}

export default function FiringItem({ firing, onClick }: FiringItemProps) {
  const statusDisplay = getStatusDisplay(firing.status);

  // Вычисляем programId из вложенного объекта
  const programId = firing.program?.id || 0;
  // Используем start_time вместо startTime
  const startTime = firing.start_time;
  // Используем actual_duration_minutes вместо duration
  const duration = firing.actual_duration_minutes || 0;
  // Используем max_recorded_temperature вместо maxTemp
  const maxTemp = firing.max_recorded_temperature || 0;

  return (
    <div 
      className="p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <span className="font-medium">Обжиг #{programId}</span>
          <span className="mx-2">•</span>
          <span className="text-sm text-muted-foreground">
            {new Date(startTime).toLocaleDateString()} в {new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">Длит.: {duration} мин</span>
          <span className="text-sm">Макс: {maxTemp}°C</span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${statusDisplay.color}`}>
            {statusDisplay.label}
          </span>
        </div>
      </div>
    </div>
  );
}