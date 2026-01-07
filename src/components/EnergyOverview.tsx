"use client";

import { EnergyReading, MonthlySummary, YearlySummary } from "@/types/energy";

interface EnergyOverviewProps {
  readings: EnergyReading[];
  onEdit: (reading: EnergyReading) => void;
  onDelete: (id: string) => void;
}

export default function EnergyOverview({ readings, onEdit, onDelete }: EnergyOverviewProps) {
  // Sort readings by date ascending
  const sortedReadings = [...readings].sort((a, b) => a.date.localeCompare(b.date));

  // Calculate monthly deltas
  const monthlySummaries: MonthlySummary[] = [];
  
  for (let i = 1; i < sortedReadings.length; i++) {
    const current = sortedReadings[i];
    const previous = sortedReadings[i - 1];
    // The usage belongs to the month of the current reading
    // (e.g., reading on March 1st = February's usage, so it's logged in March)
    const month = current.date.substring(0, 7); // YYYY-MM

    // Only include if this is the first delta for a given month
    const existingMonth = monthlySummaries.find(m => m.month === month);
    if (!existingMonth) {
      monthlySummaries.push({
        month,
        electricityDay: current.electricityDay - previous.electricityDay,
        electricityNight: current.electricityNight - previous.electricityNight,
        electricityTotal: (current.electricityDay - previous.electricityDay) + (current.electricityNight - previous.electricityNight),
        gas: current.gas - previous.gas,
      });
    }
  }

  monthlySummaries.sort((a, b) => b.month.localeCompare(a.month));

  // Calculate yearly summaries
  const yearlySummaries: YearlySummary[] = [];
  const years = [...new Set(sortedReadings.map(r => r.date.substring(0, 4)))].sort();

  for (let i = 0; i < years.length; i++) {
    const year = years[i];
    const readingsInYear = sortedReadings.filter(r => r.date.startsWith(year));
    
    if (readingsInYear.length > 0) {
      const firstReadingOfYear = readingsInYear[0];
      
      // Find first reading of next year or use last reading of current year
      let endReading: EnergyReading;
      if (i + 1 < years.length) {
        const nextYearReadings = sortedReadings.filter(r => r.date.startsWith(years[i + 1]));
        if (nextYearReadings.length > 0) {
          endReading = nextYearReadings[0];
        } else {
          endReading = sortedReadings[sortedReadings.length - 1];
        }
      } else {
        endReading = sortedReadings[sortedReadings.length - 1];
      }

      const monthlyBreakdown = monthlySummaries.filter(m => m.month.startsWith(year));

      yearlySummaries.push({
        year,
        electricityDay: endReading.electricityDay - firstReadingOfYear.electricityDay,
        electricityNight: endReading.electricityNight - firstReadingOfYear.electricityNight,
        electricityTotal: (endReading.electricityDay - firstReadingOfYear.electricityDay) + (endReading.electricityNight - firstReadingOfYear.electricityNight),
        gas: endReading.gas - firstReadingOfYear.gas,
        monthlyBreakdown,
      });
    }
  }

  yearlySummaries.sort((a, b) => b.year.localeCompare(a.year));

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  if (readings.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Energy Overview
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No readings yet. Add your first reading to see the overview.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Yearly Summary */}
      {yearlySummaries.map((yearly) => (
        <div
          key={yearly.year}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {yearly.year} Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">
                Electricity Day
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {yearly.electricityDay.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">kWh used</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                Electricity Night
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {yearly.electricityNight.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">kWh used</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <p className="text-sm text-purple-700 dark:text-purple-400 font-medium">
                Total Electricity
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {yearly.electricityTotal.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">kWh used</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <p className="text-sm text-orange-700 dark:text-orange-400 font-medium">
                Gas
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {yearly.gas.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">m³ used</p>
            </div>
          </div>

          {/* Monthly Breakdown */}
          <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
            Monthly Breakdown
          </h3>
          {yearly.monthlyBreakdown.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">
                      Month
                    </th>
                    <th className="text-right py-2 px-2 font-medium text-yellow-700 dark:text-yellow-400">
                      Day (kWh)
                    </th>
                    <th className="text-right py-2 px-2 font-medium text-blue-700 dark:text-blue-400">
                      Night (kWh)
                    </th>
                    <th className="text-right py-2 px-2 font-medium text-purple-700 dark:text-purple-400">
                      Total (kWh)
                    </th>
                    <th className="text-right py-2 px-2 font-medium text-orange-700 dark:text-orange-400">
                      Gas (m³)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {yearly.monthlyBreakdown.map((monthly) => (
                    <tr
                      key={monthly.month}
                      className="border-b border-gray-100 dark:border-gray-700/50"
                    >
                      <td className="py-2 px-2 text-gray-900 dark:text-white">
                        {formatMonth(monthly.month)}
                      </td>
                      <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">
                        {monthly.electricityDay.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">
                        {monthly.electricityNight.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">
                        {monthly.electricityTotal.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">
                        {monthly.gas.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Need at least 2 readings to calculate monthly usage
            </p>
          )}
        </div>
      ))}

      {/* All Readings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          All Readings (Cumulative Meter Values)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">
                  Date
                </th>
                <th className="text-right py-2 px-2 font-medium text-yellow-700 dark:text-yellow-400">
                  Day (kWh)
                </th>
                <th className="text-right py-2 px-2 font-medium text-blue-700 dark:text-blue-400">
                  Night (kWh)
                </th>
                <th className="text-right py-2 px-2 font-medium text-orange-700 dark:text-orange-400">
                  Gas (m³)
                </th>
                <th className="text-center py-2 px-2 font-medium text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {[...readings]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((reading) => (
                  <tr
                    key={reading.id}
                    className="border-b border-gray-100 dark:border-gray-700/50"
                  >
                    <td className="py-2 px-2 text-gray-900 dark:text-white">
                      {new Date(reading.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">
                      {reading.electricityDay.toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">
                      {reading.electricityNight.toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">
                      {reading.gas.toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => onEdit(reading)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-xs mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(reading.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
