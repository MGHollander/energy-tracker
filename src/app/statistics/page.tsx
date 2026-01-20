"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useHouses } from "@/hooks/useHouses";
import { useEnergyReadings } from "@/hooks/useEnergyReadings";
import Auth from "@/components/Auth";
import { EnergyReading, YearlySummary } from "@/types/energy";

export default function StatisticsPage() {
  const { user, loading: authLoading } = useAuth();
  const { houses, loading: housesLoading } = useHouses();
  const { readings, loading: readingsLoading } = useEnergyReadings();

  const [yearlySummaries, setYearlySummaries] = useState<YearlySummary[]>([]);

  useEffect(() => {
    if (!readings.length || !houses.length) {
      setYearlySummaries([]);
      return;
    }

    // Group readings by house
    const readingsByHouse: Record<string, EnergyReading[]> = {};
    readings.forEach(reading => {
      if (!readingsByHouse[reading.house_id]) {
        readingsByHouse[reading.house_id] = [];
      }
      readingsByHouse[reading.house_id].push(reading);
    });

    // Calculate yearly summaries for each house
    const houseYearlySummaries: Record<string, YearlySummary[]> = {};
    Object.entries(readingsByHouse).forEach(([houseId, houseReadings]) => {
      houseYearlySummaries[houseId] = calculateYearlySummaries(houseReadings);
    });

    // Aggregate across all houses
    const aggregatedSummaries = aggregateYearlySummaries(Object.values(houseYearlySummaries));

    setYearlySummaries(aggregatedSummaries);
  }, [readings, houses]);

  const calculateYearlySummaries = (readings: EnergyReading[]): YearlySummary[] => {
    const sortedReadings = [...readings].sort((a, b) => a.date.localeCompare(b.date));
    const yearlySummaries: YearlySummary[] = [];
    const years = [...new Set(sortedReadings.map(r => r.date.substring(0, 4)))].sort();

    for (let i = 0; i < years.length; i++) {
      const year = years[i];
      const readingsInYear = sortedReadings.filter(r => r.date.startsWith(year));

      if (readingsInYear.length > 0) {
        const firstReadingOfYear = readingsInYear[0];

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

        yearlySummaries.push({
          year,
          electricityHigh: endReading.electricityHigh - firstReadingOfYear.electricityHigh,
          electricityLow: (endReading.electricityLow ?? 0) - (firstReadingOfYear.electricityLow ?? 0),
          electricityTotal: (endReading.electricityHigh - firstReadingOfYear.electricityHigh) + ((endReading.electricityLow ?? 0) - (firstReadingOfYear.electricityLow ?? 0)),
          gas: endReading.gas - firstReadingOfYear.gas,
          water: (endReading.water ?? 0) - (firstReadingOfYear.water ?? 0),
          monthlyBreakdown: [], // Not needed for overall stats
        });
      }
    }

    return yearlySummaries.sort((a, b) => b.year.localeCompare(a.year));
  };

  const aggregateYearlySummaries = (houseSummaries: YearlySummary[][]): YearlySummary[] => {
    const yearMap: Record<string, YearlySummary> = {};

    houseSummaries.forEach(summaries => {
      summaries.forEach(summary => {
        if (!yearMap[summary.year]) {
          yearMap[summary.year] = {
            year: summary.year,
            electricityHigh: 0,
            electricityLow: null,
            electricityTotal: 0,
            gas: 0,
            water: 0,
            monthlyBreakdown: [],
          };
        }

        yearMap[summary.year].electricityHigh += summary.electricityHigh;
        yearMap[summary.year].electricityLow = (yearMap[summary.year].electricityLow ?? 0) + (summary.electricityLow ?? 0);
        yearMap[summary.year].electricityTotal += summary.electricityTotal;
        yearMap[summary.year].gas += summary.gas;
        yearMap[summary.year].water += summary.water;
      });
    });

    return Object.values(yearMap).sort((a, b) => b.year.localeCompare(a.year));
  };

  if (authLoading || housesLoading || readingsLoading) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Loading...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Auth />
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Statistics
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Overall energy consumption across all your houses
              </p>
            </div>
          </div>
        </header>

        {/* Yearly Statistics */}
        {yearlySummaries.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No data available. Add readings to your houses to see statistics.
            </p>
          </div>
        ) : (
          yearlySummaries.map((yearly) => (
            <div
              key={yearly.year}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {yearly.year} Overall Summary
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">
                    Electricity High
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {yearly.electricityHigh.toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">kWh used</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                    Electricity Low
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {yearly.electricityLow !== null ? yearly.electricityLow.toFixed(0) : '-'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">kWh used</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <p className="text-sm text-purple-700 dark:text-purple-400 font-medium">
                    Total Electricity
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {yearly.electricityTotal.toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">kWh used</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                  <p className="text-sm text-orange-700 dark:text-orange-400 font-medium">
                    Gas
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {yearly.gas.toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">m³ used</p>
                </div>
                <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4">
                  <p className="text-sm text-cyan-700 dark:text-cyan-400 font-medium">
                    Water
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {yearly.water?.toFixed(0) ?? "N/A"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">m³ used</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}