'use client';
import { useState, useEffect } from 'react';

export function usePrograms() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:9090/api/firing-programs');
      if (!res.ok) throw new Error('Failed to fetch programs');
      const data = await res.json();
      setPrograms(data);
    } catch (err: any) {
      setError(err.message);
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
    reload: fetchPrograms, // 👈 сюда добавили
    setPrograms,           // 👈 чтобы можно было вручную обновить один элемент
  };
}
