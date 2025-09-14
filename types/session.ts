// src/types/session.ts

export interface TemperatureReading {
  timestamp: string;
  temperature: number;
  session_id: number;
}

export interface ProgramStep {
  step_number: number;
  target_temperature_c: number;
  ramp_time_minutes: number;
  hold_time_minutes: number;
}

export interface FiringProgram {
  id: number;
  name: string;
  steps: ProgramStep[];
}

export interface FiringSession {
  id: number;
  program: FiringProgram;
  start_time: string;
  end_time?: string;
  status: string;
  
  actual_duration_minutes?: number;
  max_recorded_temperature?: number;
  notes?: string;
  temperature_readings: TemperatureReading[];
}

export interface ChartDataPoint {
  time: string;
  temperature?: number;
  targetTemp?: number;
}


export interface Program {
  id: number;
  name: string;
}