// src/services/apiService.ts
import { FiringSession, FiringProgram,TemperatureReading } from '@/types/session';
import {Program} from '@/types/types';
// src/services/apiService.ts

// src/services/apiService.ts

// const API_BASE_URL =
//   process.env.NODE_ENV === 'development'
//     ? process.env.NEXT_PUBLIC_API_URL // ← http://localhost:9090/api
//     : '/api'; // ← для продакшена, где rewrites работают
const API_BASE_URL = '/api';

// Утилита для обработки ошибок
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }
  return response;
};

export const ApiService = {
  // Получить статус устройства

  async getStatus(unitId: number): Promise<string> {
    const res = await fetch(`/api/status/${unitId}`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }
    return await res.text();
  },

  // Выбрать программу
  async selectProgram(unitId: number, programNumber: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/firing-management/select-program?programNumber=${programNumber}&unitId=${unitId}`,
      { method: 'POST' }
    );
    await handleResponse(response);
  },

  // Остановить/запустить печь
  async startStop(unitId: number, start: boolean): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/firing-management/start-stop?start=${start}&unitId=${unitId}`,
      { method: 'POST' }
    );
    await handleResponse(response);
  },

  // Создать сессию
  async createSession(programNumber: number): Promise<{ id: string }> {
    const response = await fetch(`${API_BASE_URL}/session?programNumber=${programNumber}`,{ method: 'POST' });
    await handleResponse(response);
    return response.json();
  },

  // Активировать сессию
  async activateSession(sessionId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/session/${sessionId}/start`,
      { method: 'POST' }
    );
    await handleResponse(response);
  },

  // Получить текущую температуру
  async getTemperature(): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/runtime/temp`);
    if (!response.ok) {
      throw new Error('Failed to fetch temperature');
    }
    const data = await response.json();
    return data.temperature;
  },

  // Получить данные сессии по ID
  async getSessionData(sessionId: string): Promise<FiringSession> {
    const response = await fetch(`${API_BASE_URL}/session?sessionId=${sessionId}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  // Получить последние сессии (обжиги)
  async getRecentFirings(): Promise<FiringSession[]> {
    const response = await fetch(`${API_BASE_URL}/session/recent`);
    if (!response.ok) {
      throw new Error('Failed to fetch recent firings');
    }
    return response.json();
  },

  // Получить данные программы для сессии
async getProgramDataForSession(sessionId: string): Promise<FiringProgram> {
    // Преобразуем в число, если нужно
    const numericId = parseInt(sessionId, 10);
    if (isNaN(numericId)) {
      throw new Error(`Invalid session ID: ${sessionId}`);
    }
    
    const response = await fetch(`${API_BASE_URL}/session/program/${numericId}/data`);
    if (!response.ok) {
      throw new Error('Failed to fetch program data');
    }
    return response.json();
  },

  // Получить runtime данные температуры
 async getRuntimeTemperature(sessionId: string): Promise<TemperatureReading[]> {
    // Преобразуем в число, если нужно
    const numericId = parseInt(sessionId, 10);
    if (isNaN(numericId)) {
      throw new Error(`Invalid session ID: ${sessionId}`);
    }
    
    const response = await fetch(`${API_BASE_URL}/runtime?sessionId=${numericId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch runtime temperature');
    }
    return response.json();
  },
    async getCurrentProgram(): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/firing-management/current-program`);
    if (!response.ok) {
      throw new Error('Failed to fetch current program');
    }
    return response.json();
  },
// Получить все зафиксированные температурные показания сессии (для истории/графика)
  async getSessionTemperatureReadings(sessionId: string): Promise<TemperatureReading[]> {
    const numericId = parseInt(sessionId, 10);
    if (isNaN(numericId)) {
      throw new Error(`Invalid session ID: ${sessionId}`);
    }

    const url = `${API_BASE_URL}/runtime?sessionId=${numericId}`;
    console.log("Fetching:", url);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(`Failed to fetch session temperature readings: ${response.status} ${errorText}`);
      }

      return response.json();
    } catch (err) {
      console.error("Fetch error:", err);
      throw new Error('Failed to fetch session temperature readings');
    }
  },

// Получение всех программ
async getFiringPrograms(): Promise<FiringProgram[]> {
  const response = await fetch(`${API_BASE_URL}/firing-programs`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }
  return response.json();
},


// Создание программы
async createFiringProgram(programData: any): Promise<FiringProgram> {
  const response = await fetch(`${API_BASE_URL}/firing-programs/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(programData),
  });
  await handleResponse(response);
  return response.json();
},

// Обновление программы
async updateFiringProgram(programId: number, programData: any): Promise<FiringProgram> {
  const response = await fetch(`${API_BASE_URL}/firing-programs/${programId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(programData),
  });
  await handleResponse(response);
  return response.json();
},

// Удаление программы
async deleteFiringProgram(programId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/firing-programs/${programId}`, {
    method: 'DELETE',
  });
  await handleResponse(response);
},

// Получить одну программу по ID
async getFiringProgramById(programId: number): Promise<FiringProgram> {
  const response = await fetch(`${API_BASE_URL}/firing-programs/${programId}`);
  await handleResponse(response);
  return response.json();
},

// Загрузить программу на устройство (deploy)
async deployFiringProgram(programId: number, deviceProgramId: number): Promise<string> {
  const response = await fetch(
    `${API_BASE_URL}/firing-programs/${programId}/deploy?deviceProgramId=${deviceProgramId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }
  );
  await handleResponse(response);
  return response.text(); // сервер возвращает текст
},

async getFiringProgramForChart(programId: number): Promise<FiringProgram> {
  const response = await fetch(`${API_BASE_URL}/firing-programs/${programId}`);
  await handleResponse(response);
  return response.json();
},


async getDeviceProgramById(programId: number): Promise<Program> {
  const response = await fetch(`${API_BASE_URL}/firing-programs/device/program/${programId}`);
  await handleResponse(response);
  return response.json();
},


async getCurrentPower(): Promise<number> {
  try {
    const response = await fetch(`${API_BASE_URL}/firing-management/current-power`);

    // Если статус не OK — возвращаем 0, не ломаемся
    if (!response.ok) {
      console.warn(`[getCurrentPower] API returned ${response.status}. Returning 0.`);
      return 0;
    }

    const data = await response.json();

    // Проверяем, что data — число. Если нет — возвращаем 0.
    if (typeof data !== 'number') {
      console.warn(`[getCurrentPower] Expected number, got:`, data);
      return 0;
    }

    return data;
  } catch (err) {
    console.error('[getCurrentPower] Network or parsing error:', err);
    return 0; // безопасное значение по умолчанию
  }
}
};