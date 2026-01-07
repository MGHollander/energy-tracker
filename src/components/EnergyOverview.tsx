"use client";

import { EnergyReading, MonthlySummary, YearlySummary } from "@/types/energy";

interface EnergyOverviewProps {
  readings: EnergyReading[];
}

export default function EnergyOverview({ readings }: EnergyOverviewProps) {
  const monthlySummaries: MonthlySummary[] = readings.reduce((acc, reading) => {
    const month = reading.date.substring(0, 7); // YYYY-MM
    const existing = acc.find((m) => m.month === month);

    if (existing) {
      existing.electricityDay += reading.electricityDay;
      existing.electricityNight += reading.electricityNight;
      existing.electricityTotal += reading.electricityDay + reading.electricityNight;
      existing.gas += reading.gas;
    } else {
      acc.push({
        month,
        electricityDay: reading.electricityDay,
        electricityNight: reading.electricityNight,
        electricityTotal: reading.electricityDay + reading.electricityNight,
        gas: reading.gas,
      });
    }

    return acc;
  }, [] as MonthlySummary[]);

  monthlySummaries.sort((a, b) => b.month.localeCompare(a.month));

  const yearlySummaries: YearlySummary[] = monthlySummaries.reduce((acc, monthly) => {
    const year = monthly.month.substring(0, 4);
    const existing = acc.find((y) => y.year === year);

    if (existing) {
      existing.electricityDay += monthly.electricityDay;
      existing.electricityNight += monthly.electricityNight;
      existing.electricityTotal += monthly.electricityTotal;
      existing.gas += monthly.gas;
    } else {
      acc.push({
        year,
        electricityDay: monthly.electricityDay,
        electricityNight: monthly.electricityNight,
        electricityTotal: monthly.electricityTotal,
        gas: monthly.gas,
        monthlyBreakdown: [],
      });
    }

    return acc;
  }, [] as YearlySummary[]);

  yearlySummaries.forEach((yearly) => {
    yearly.monthlyBreakdown = monthlySummaries.filter(
      (m) => m.month.startsWith(yearly.year)
    );
  });

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
              <p className="text-xs text-gray-500 dark:text-gray-400">kWh</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                Electricity Night
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {yearly.electricityNight.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">kWh</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <p className="text-sm text-purple-700 dark:text-purple-400 font-medium">
                Total Electricity
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {yearly.electricityTotal.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">kWh</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <p className="text-sm text-orange-700 dark:text-orange-400 font-medium">
                Gas
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {yearly.gas.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">m³</p>
            </div>
          </div>

          {/* Monthly Breakdown */}
          <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
            Monthly Breakdown
          </h3>
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
        </div>
      ))}

      {/* All Readings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          All Readings
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
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
