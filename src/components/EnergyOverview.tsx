"use client";

import { useState, useTransition } from 'react';
import { EnergyReading, MonthlySummary, YearlySummary } from "@/types/energy";
import { exportAllReadingsOverwrite } from "@/actions/exportReadings";

interface EnergyOverviewProps {
  readings: EnergyReading[];
  onEdit: (reading: EnergyReading) => void;
  onDelete: (id: string) => void;
  houseId?: string;
}

export default function EnergyOverview({ readings, onEdit, onDelete, houseId }: EnergyOverviewProps) {
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
        electricityHigh: current.electricityHigh - previous.electricityHigh,
        electricityLow: current.electricityLow - previous.electricityLow,
        electricityTotal: (current.electricityHigh - previous.electricityHigh) + (current.electricityLow - previous.electricityLow),
        gas: current.gas - previous.gas,
        water: (current.water ?? 0) - (previous.water ?? 0),
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
        electricityHigh: endReading.electricityHigh - firstReadingOfYear.electricityHigh,
        electricityLow: endReading.electricityLow - firstReadingOfYear.electricityLow,
        electricityTotal: (endReading.electricityHigh - firstReadingOfYear.electricityHigh) + (endReading.electricityLow - firstReadingOfYear.electricityLow),
        gas: endReading.gas - firstReadingOfYear.gas,
        water: (endReading.water ?? 0) - (firstReadingOfYear.water ?? 0),
        monthlyBreakdown,
      });
    }
  }

  yearlySummaries.sort((a, b) => b.year.localeCompare(a.year));

  // State for collapsible overviews
  const [yearlyExpanded, setYearlyExpanded] = useState<boolean[]>(
    yearlySummaries.map((_, index) => index === 0)
  );
  const [allReadingsExpanded, setAllReadingsExpanded] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const handleExportOverwrite = () => {
    startTransition(async () => {
      try {
        await exportAllReadingsOverwrite(houseId);
        alert('Export overwritten successfully');
      } catch (error) {
        const err = error as Error;
        alert('Failed to overwrite export: ' + err.message);
      }
    });
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
      {yearlySummaries.map((yearly, index) => (
        <div
          key={yearly.year}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {yearly.year} Summary
            </h2>
            <button
              onClick={() => setYearlyExpanded(prev => prev.map((v, i) => i === index ? !v : v))}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
            >
              {yearlyExpanded[index] ? 'Collapse' : 'Expand'}
            </button>
          </div>
          {yearlyExpanded[index] && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">
                    Electricity High
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {yearly.electricityHigh.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">kWh used</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                    Electricity Low
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {yearly.electricityLow.toFixed(2)}
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
                <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4">
                  <p className="text-sm text-cyan-700 dark:text-cyan-400 font-medium">
                    Water
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {yearly.water?.toFixed(2) ?? "N/A"}
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
                          High (kWh)
                        </th>
                        <th className="text-right py-2 px-2 font-medium text-blue-700 dark:text-blue-400">
                          Low (kWh)
                        </th>
                        <th className="text-right py-2 px-2 font-medium text-purple-700 dark:text-purple-400">
                          Total (kWh)
                        </th>
                        <th className="text-right py-2 px-2 font-medium text-orange-700 dark:text-orange-400">
                          Gas (m³)
                        </th>
                        <th className="text-right py-2 px-2 font-medium text-cyan-700 dark:text-cyan-400">
                          Water (m³)
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
                            {monthly.electricityHigh.toFixed(2)}
                          </td>
                          <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">
                            {monthly.electricityLow.toFixed(2)}
                          </td>
                          <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">
                            {monthly.electricityTotal.toFixed(2)}
                          </td>
                          <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">
                            {monthly.gas.toFixed(2)}
                          </td>
                          <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">
                            {monthly.water.toFixed(2)}
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
            </>
          )}
        </div>
      ))}

      {/* All Readings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            All Readings (Cumulative Meter Values)
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm px-3 py-1 border border-blue-600 dark:border-blue-400 rounded"
              >
                Export ▼
              </button>
              {exportDropdownOpen && (
                <div className="absolute bottom-10 right-0 mt-1 w-64 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-lg z-10">
                  <button
                    onClick={() => {
                      handleExportOverwrite();
                      setExportDropdownOpen(false);
                    }}
                    disabled={isPending}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    {isPending ? 'Overwriting...' : 'Export all readings'}
                  </button>
                  <button
                    onClick={() => {
                      window.open(`/api/export/all${houseId ? `?houseId=${houseId}` : ''}`, '_blank')
                      setExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Export all readings and download
                  </button>
                  <button
                    onClick={() => {
                      window.open(`/api/export/current${houseId ? `?houseId=${houseId}` : ''}`, '_blank')
                      setExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Download current export
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setAllReadingsExpanded(!allReadingsExpanded)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
            >
              {allReadingsExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>
        {allReadingsExpanded && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">
                    Date
                  </th>
                  <th className="text-right py-2 px-2 font-medium text-yellow-700 dark:text-yellow-400">
                    High (kWh)
                  </th>
                  <th className="text-right py-2 px-2 font-medium text-blue-700 dark:text-blue-400">
                    Low (kWh)
                  </th>
                  <th className="text-right py-2 px-2 font-medium text-orange-700 dark:text-orange-400">
                    Gas (m³)
                  </th>
                  <th className="text-right py-2 px-2 font-medium text-cyan-700 dark:text-cyan-400">
                    Water (m³)
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
                        {reading.electricityHigh.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">
                        {reading.electricityLow.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">
                        {reading.gas.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300">
                        {reading.water?.toFixed(2) ?? "N/A"}
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
        )}
      </div>
    </div>
  );
}
