import { FiringSession } from '@/types/session';
import { getStatusDisplay } from '@/constants/statusConfig';
import { Trash2 } from 'lucide-react'; // Импортируем иконку
interface FiringItemProps {
  firing: FiringSession;
  onClick: () => void;
  onDeleteClick: (event: React.MouseEvent) => void; 
}

export default function FiringItem({ firing, onClick, onDeleteClick }: FiringItemProps) {
  const statusDisplay = getStatusDisplay(firing.status);

  // Вычисляем programId из вложенного объекта
  const programId = firing.program?.id || 0;
  // Используем start_time вместо startTime
  const startTime = firing.start_time;
  // Используем actual_duration_minutes вместо duration
  const duration = firing.actual_duration_minutes || 0;
  // Используем max_recorded_temperature вместо maxTemp
  const maxTemp = Math.round(firing.max_recorded_temperature) || 0;

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

                    <button
            onClick={onDeleteClick}
            className="p-1 rounded-full hover:bg-red-100 text-red-600 transition-colors"
            aria-label="Удалить сессию"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}