// src/hooks/useTemperature.ts

'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/services/apiService';

export const useTemperature = () => {
  const [currentTemp, setCurrentTemp] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTemperature = async () => {
    try {
      setLoading(true);
      const tempValue = await ApiService.getTemperature();

      // Защита от "космических" значений
      if (tempValue > 1 || tempValue < -1400) {
        setCurrentTemp(25); // fallback
      } else {
        setCurrentTemp(Math.round(tempValue));
      }
    } catch (error) {
      console.error('Ошибка получения температуры:', error);
      setCurrentTemp(25); // fallback при ошибке
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemperature();
    const interval = setInterval(fetchTemperature, 5000);
    return () => clearInterval(interval);
  }, []);

  return { currentTemp, loading };
};