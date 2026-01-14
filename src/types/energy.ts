export interface EnergyReading {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  electricityDay: number; // Electricity usage during daylight (kWh)
  electricityNight: number; // Electricity usage at night (kWh)
  gas: number; // Gas usage (m³ or kWh depending on region)
  user_id: string; // User ID from Supabase
  created_at: string; // Created timestamp
  updated_at: string; // Updated timestamp
}

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
