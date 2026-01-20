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
  electricityHigh: number; // Electricity usage during high tariff (kWh)
  electricityLow?: number | null; // Electricity usage during low tariff (kWh) - optional
  gas: number; // Gas usage (m³ or kWh depending on region)
  water: number | null; // Water usage (m³)
  user_id: string; // User ID from Supabase
  house_id: string;
  created_at: string; // Created timestamp
  updated_at: string; // Updated timestamp
}

export type EnergyReadingInput = Omit<EnergyReading, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export interface MonthlySummary {
  month: string; // YYYY-MM
  electricityHigh: number;
  electricityLow: number | null;
  electricityTotal: number;
  gas: number;
  water: number;
}

export interface YearlySummary {
  year: string;
  electricityHigh: number;
  electricityLow: number | null;
  electricityTotal: number;
  gas: number;
  water: number;
  monthlyBreakdown: MonthlySummary[];
}
