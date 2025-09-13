// src/hooks/useDevicePrograms.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { ApiService } from '@/services/apiService';
import { Program } from '@/types/types';

export const useDevicePrograms = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<{ [key: number]: string }>({});

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    setErrors({});

    const programIds = [1, 2, 3];
    const fetchedPrograms: Program[] = [];

    await Promise.allSettled(
      programIds.map(async (id) => {
        try {
          const program = await ApiService.getDeviceProgramById(id);
          fetchedPrograms.push(program);
        } catch (err: any) {
          console.error(`Ошибка загрузки программы ${id}:`, err);
          setErrors((prev) => ({
            ...prev,
            [id]: err.message || 'Неизвестная ошибка',
          }));
        }
      })
    );

    setPrograms(fetchedPrograms);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  return {
    programs,
    loading,
    errors,
    refetch: fetchPrograms, // ✅ Метод для ручного обновления
  };
};