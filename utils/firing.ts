// utils/firing.ts
import { FiringSession } from '@/types/session';

export const getFiringDisplayData = (firing: FiringSession) => ({
  programId: firing.program?.id || 0,
  startTime: firing.start_time,
  duration: firing.actual_duration_minutes || 0,
  maxTemp: firing.max_recorded_temperature || 0,
  status: firing.status,
});