// src/types.ts

export interface Step {
  step_number: number;
  target_temperature_c: number;
  ramp_time_minutes: number;
  hold_time_minutes: number;
}

export interface Program {
  id: number;
  name: string;
  steps: Step[];
}

export interface ChartDataPoint {
  time: number;
  temperature: number;
}