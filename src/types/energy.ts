export interface EnergyReading {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  electricityDay: number; // Electricity usage during daylight (kWh)
  electricityNight: number; // Electricity usage at night (kWh)
  gas: number; // Gas usage (m³ or kWh depending on region)
}

export interface StartNumbers {
  electricityDay: number;
  electricityNight: number;
  gas: number;
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
