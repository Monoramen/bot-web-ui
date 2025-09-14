// src/hooks/usePower.ts
'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/services/apiService';

export const usePower = () => {
  const [power, setPower] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPower = async () => {
      try {
        setLoading(true);
        const powerValue = await ApiService.getCurrentPower();
        setPower(powerValue);
      } catch (err) {
        console.error('Ошибка загрузки мощности:', err);
        setError('Не удалось загрузить мощность');
        setPower(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPower();

    // Обновляем каждые 5 секунд
    const interval = setInterval(fetchPower, 5000);
    return () => clearInterval(interval);
  }, []);

  return { power, loading, error };
};