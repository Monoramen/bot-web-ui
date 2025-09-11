'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import DeviceParameterChart from '@/components/DeviceParametersChart';
import { Program } from '@/types/types';

// A component to handle data fetching and state management.
const ProgramLoader: React.FC = () => {
  const [programs, setPrograms] = useState<Program[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:9090/api/firing-programs/device/parameters/all');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Program[] = await response.json();
        setPrograms(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-48 text-destructive">
        Ошибка: {error}
      </div>
    );
  }

  if (!programs || programs.length === 0) {
    return (
      <div className="col-span-full flex justify-center items-center h-48 text-muted-foreground">
        Нет доступных программ.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {programs.map((program) => (
        
        <DeviceParameterChart key={program.id} program={program} />

        
         
      ))}
    </div>
  );
};

export default ProgramLoader;