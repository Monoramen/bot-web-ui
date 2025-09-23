// src/utils/timeUtils.ts
export const minutesToTimeString = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const formatTimeFromStart = (timestamp: string | number | Date | null | undefined, startTime: string | null): string => {
  if (!timestamp || !startTime) return "—";

  const start = new Date(startTime);
  const current = new Date(timestamp);
  const elapsedMinutes = Math.floor((current.getTime() - start.getTime()) / 60000);

  return minutesToTimeString(elapsedMinutes);
};