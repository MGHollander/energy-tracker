export interface House {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface EnergyReading {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  electricityDay: number; // Electricity usage during daylight (kWh)
  electricityNight: number; // Electricity usage at night (kWh)
  gas: number; // Gas usage (m³ or kWh depending on region)
  user_id: string; // User ID from Supabase
  house_id: string;
  created_at: string; // Created timestamp
  updated_at: string; // Updated timestamp
}

export type EnergyReadingInput = Omit<EnergyReading, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export interface MonthlySummary {
  month: string; // YYYY-MM
  electricityDay: number;
  electricityNight: number;
  electricityTotal: number;
  gas: number;
}

export interface YearlySummary {
  year: string;
  electricityDay: number;
  electricityNight: number;
  electricityTotal: number;
  gas: number;
  monthlyBreakdown: MonthlySummary[];
}
