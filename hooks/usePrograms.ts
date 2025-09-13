// src/hooks/usePrograms.ts
'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/services/apiService';

export function usePrograms() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getFiringPrograms(); // 👈 добавим этот метод в ApiService
      setPrograms(data);
    } catch (err: any) {
      setError(err.message || 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  return {
    programs,
    loading,
    error,
    reload: fetchPrograms,
    setPrograms,
  };
}