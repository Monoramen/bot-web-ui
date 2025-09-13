// src/components/dashboard/ChartEmptyState.tsx

interface ChartEmptyStateProps {
  sessionId: string | null;
}

export default function ChartEmptyState({ sessionId }: ChartEmptyStateProps) {
  if (!sessionId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Выберите программу и запустите обжиг
      </div>
    );
  }

  return (
    <div className="text-center py-8 text-muted-foreground">
      Нет данных для отображения
    </div>
  );
}