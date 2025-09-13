// src/constants/statusConfig.ts

export const statusConfig = {
  STOPPED: { label: "Остановлен", color: "bg-gray-100 text-gray-800" },
  RUNNING: { label: "В работе", color: "bg-blue-100 text-blue-800" },
  CRITICAL_ERROR: { label: "Авария!", color: "bg-red-100 text-red-800 animate-pulse" },
  PROGRAM_COMPLETED: { label: "Завершён", color: "bg-green-100 text-green-800 font-medium" },
  PID_AUTOTUNE_RUNNING: { label: "Автонастройка", color: "bg-purple-100 text-purple-800" },
  PID_AUTOTUNE_WAITING: { label: "Ожидание", color: "bg-yellow-100 text-yellow-800" },
  PID_AUTOTUNE_COMPLETED: { label: "Настроено", color: "bg-indigo-100 text-indigo-800" },
  SETTINGS: { label: "Настройка", color: "bg-orange-100 text-orange-800" },
  UNKNOWN: { label: "Неизвестно", color: "bg-muted text-foreground" }
};

export type FiringStatus = keyof typeof statusConfig;

export const getStatusDisplay = (statusKey: string) => {
  return statusConfig[statusKey as FiringStatus] || statusConfig.UNKNOWN;
};