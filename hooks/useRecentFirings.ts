// src/hooks/useRecentFirings.ts

'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/services/apiService';
import { getStatusDisplay, FiringStatus } from '@/constants/statusConfig';
import { FiringSession } from '@/types/session';



export const useRecentFirings = () => {
  const [recentFirings, setRecentFirings] = useState<FiringSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentFirings = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getRecentFirings();

const formatted = data.map(session => ({
  id: session.id,
  program: session.program, // ✅ уже есть
  start_time: session.start_time, // ✅ используем snake_case, как в FiringSession
  actual_duration_minutes: session.actual_duration_minutes || 0, // ✅ переименовано
  max_recorded_temperature: session.max_recorded_temperature || 0, // ✅ переименовано
  status: (session.status || 'UNKNOWN') as FiringStatus,
  temperature_readings: session.temperature_readings || [], // ✅ обязательно — не может быть undefined
 
}));

      setRecentFirings(formatted);
    } catch (err) {
      console.error('Ошибка загрузки последних обжигов:', err);
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentFirings();
  }, []);

  return { recentFirings, loading, error, refetch: fetchRecentFirings };
};