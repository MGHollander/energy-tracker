"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { useEnergyReadings } from "@/hooks/useEnergyReadings";
import Auth from "@/components/Auth";
import { EnergyReading, YearlySummary, MonthlySummary, House } from "@/types/energy";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function HouseStatisticsPage() {
  const params = useParams();
  const houseId = params.id as string;
  const { user, loading: authLoading } = useAuth();
  const [house, setHouse] = useState<House | null>(null);
  const [houseLoading, setHouseLoading] = useState(true);
  const [houseError, setHouseError] = useState<string | null>(null);

  const { readings, loading: readingsLoading } = useEnergyReadings(houseId);

  const [yearlySummaries, setYearlySummaries] = useState<YearlySummary[]>([]);
  const [monthlyComparisons, setMonthlyComparisons] = useState<Record<string, MonthlySummary[]>>({}); // TODO: Define MonthlySummary type or import from "@/types/energy"
  const [monthlyData, setMonthlyData] = useState<MonthlySummary[]>([]);
  const [activeTab, setActiveTab] = useState<'table' | 'chart'>('table');

  useEffect(() => {
    if (!user || !houseId) {
      setHouseLoading(false);
      return;
    }

    const fetchHouse = async () => {
      setHouseLoading(true);
      const { data, error } = await supabase
        .from('houses')
        .select('*')
        .eq('id', houseId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        setHouseError(error.message);
      } else if (!data) {
        setHouseError('House not found or access denied');
      } else {
        setHouse(data);
        setHouseError(null);
      }
      setHouseLoading(false);
    };

    fetchHouse();
  }, [user, houseId]);

  useEffect(() => {
    if (!readings.length) {
      setYearlySummaries([]);
      return;
    }

    // Calculate yearly summaries for this house
    const { yearlySummaries: houseYearlySummaries, monthlySummaries } = calculateYearlySummaries(readings);

    setYearlySummaries(houseYearlySummaries);
    setMonthlyData(monthlySummaries);

    // Calculate monthly comparisons
    const comparisons: Record<string, MonthlySummary[]> = {};
    houseYearlySummaries.forEach(yearSummary => {
      yearSummary.monthlyBreakdown.forEach(monthly => {
        const monthKey = monthly.month.substring(5, 7); // MM
        if (!comparisons[monthKey]) {
          comparisons[monthKey] = [];
        }
        comparisons[monthKey].push(monthly);
      });
    });

    // Sort each month's summaries by year descending
    Object.keys(comparisons).forEach(month => {
      comparisons[month].sort((a, b) => b.month.localeCompare(a.month));
    });

    setMonthlyComparisons(comparisons);
  }, [readings]);

  const calculateYearlySummaries = (readings: EnergyReading[]): { yearlySummaries: YearlySummary[], monthlySummaries: MonthlySummary[] } => {
    const sortedReadings = [...readings].sort((a, b) => a.date.localeCompare(b.date));
    const yearlySummaries: YearlySummary[] = [];
    const years = [...new Set(sortedReadings.map(r => r.date.substring(0, 4)))].sort();

    // Calculate monthly summaries
    const monthlySummaries: MonthlySummary[] = [];
    for (let i = 1; i < sortedReadings.length; i++) {
      const current = sortedReadings[i];
      const previous = sortedReadings[i - 1];
      const month = previous.date.substring(0, 7); // YYYY-MM

      const existingMonth = monthlySummaries.find(m => m.month === month);
      if (!existingMonth) {
        monthlySummaries.push({
          month,
          electricityHigh: current.electricityHigh - previous.electricityHigh,
          electricityLow: (current.electricityLow ?? 0) - (previous.electricityLow ?? 0),
          electricityTotal: (current.electricityHigh - previous.electricityHigh) + ((current.electricityLow ?? 0) - (previous.electricityLow ?? 0)),
          gas: current.gas - previous.gas,
          water: (current.water ?? 0) - (previous.water ?? 0),
        });
      }
    }

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

        const monthlyBreakdown = monthlySummaries.filter(m => m.month.startsWith(year));

        yearlySummaries.push({
          year,
          electricityHigh: endReading.electricityHigh - firstReadingOfYear.electricityHigh,
          electricityLow: (endReading.electricityLow ?? 0) - (firstReadingOfYear.electricityLow ?? 0),
          electricityTotal: (endReading.electricityHigh - firstReadingOfYear.electricityHigh) + ((endReading.electricityLow ?? 0) - (firstReadingOfYear.electricityLow ?? 0)),
          gas: endReading.gas - firstReadingOfYear.gas,
          water: (endReading.water ?? 0) - (firstReadingOfYear.water ?? 0),
          monthlyBreakdown,
        });
      }
    }

    return {
      yearlySummaries: yearlySummaries.sort((a, b) => b.year.localeCompare(a.year)),
      monthlySummaries
    };
  };

  if (authLoading || houseLoading || readingsLoading) {
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

  if (houseError) {
    return (
      <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Error
            </h1>
            <p className="text-red-600 dark:text-red-400 mb-6">
              {houseError}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!house) {
    return (
      <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              House Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The house you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb/Header */}
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {house.name} Statistics
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Energy consumption statistics for {house.name}
              </p>
            </div>
          </div>
        </header>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('table')}
            className={`px-4 py-2 rounded ${activeTab === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            Table
          </button>
          <button
            onClick={() => setActiveTab('chart')}
            className={`px-4 py-2 rounded ${activeTab === 'chart' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            Charts
          </button>
        </div>

        {/* Yearly Statistics */}
        {activeTab === 'table' && yearlySummaries.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No data available. Add readings to {house.name} to see statistics.
            </p>
          </div>
        ) : activeTab === 'table' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Yearly Summaries
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white dark:bg-gray-800">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">
                      Year
                    </th>
                    <th className="text-right py-2 px-2 font-medium text-yellow-700 dark:text-yellow-400">
                      Electricity High (kWh)
                    </th>
                    <th className="text-right py-2 px-2 font-medium text-blue-700 dark:text-blue-400">
                      Electricity Low (kWh)
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
                  {yearlySummaries.map((yearly) => (
                    <tr key={yearly.year} className="border-b border-gray-100 dark:border-gray-700/50">
                      <td className="py-4 px-2 text-gray-900 dark:text-white font-medium">
                        {yearly.year}
                      </td>
                      <td className="py-4 px-2 text-right text-gray-700 dark:text-gray-300">
                        {yearly.electricityHigh.toFixed(0)}
                      </td>
                      <td className="py-4 px-2 text-right text-gray-700 dark:text-gray-300">
                        {yearly.electricityLow !== null ? yearly.electricityLow.toFixed(0) : '-'}
                      </td>
                      <td className="py-4 px-2 text-right text-gray-700 dark:text-gray-300">
                        {yearly.gas.toFixed(0)}
                      </td>
                      <td className="py-4 px-2 text-right text-gray-700 dark:text-gray-300">
                        {yearly.water?.toFixed(0) ?? "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Monthly Year-over-Year Comparisons */}
        {activeTab === 'table' && Object.keys(monthlyComparisons).length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Monthly Year-over-Year Comparisons
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white dark:bg-gray-800">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">
                      Year
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
                    <th className="text-right py-2 px-2 font-medium text-gray-700 dark:text-gray-300">
                      Change vs Prev Year
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(monthlyComparisons)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .flatMap(([month, summaries]) => [
                      <tr key={`month-${month}`} className="bg-gray-50 dark:bg-gray-700/50">
                        <td colSpan={6} className="p-2 font-medium text-gray-900 dark:text-white">
                          {new Date(2024, parseInt(month) - 1).toLocaleDateString("en-US", { month: "long" })}
                        </td>
                      </tr>,
                      ...summaries.map((summary, index) => {
                        const prevYear = summaries[index + 1];
                        const change = prevYear ? {
                          electricityHigh: ((summary.electricityHigh - prevYear.electricityHigh) / prevYear.electricityHigh * 100),
                          electricityTotal: ((summary.electricityTotal - prevYear.electricityTotal) / prevYear.electricityTotal * 100),
                          gas: ((summary.gas - prevYear.gas) / prevYear.gas * 100),
                          water: prevYear.water && summary.water ? ((summary.water - prevYear.water) / prevYear.water * 100) : null,
                        } : null;

                        return (
                          <tr key={summary.month} className="border-b border-gray-100 dark:border-gray-700/50">
                            <td className="py-4 px-2 text-gray-900 dark:text-white font-medium">
                              {summary.month.substring(0, 4)}
                            </td>
                            <td className="py-4 px-2 text-right text-gray-700 dark:text-gray-300">
                              {summary.electricityHigh.toFixed(0)}
                            </td>
                            <td className="py-4 px-2 text-right text-gray-700 dark:text-gray-300">
                              {summary.electricityLow !== null ? summary.electricityLow.toFixed(0) : '-'}
                            </td>
                            <td className="py-4 px-2 text-right text-gray-700 dark:text-gray-300">
                              {summary.gas.toFixed(0)}
                            </td>
                            <td className="py-4 px-2 text-right text-gray-700 dark:text-gray-300">
                              {summary.water?.toFixed(0) ?? "N/A"}
                            </td>
                            <td className="py-4 px-2 text-right">
                              {change ? (
                                <div className="space-y-1">
                                  <div className={`text-xs ${change.gas >= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                    {change.gas >= 0 ? '+' : ''}{change.gas.toFixed(1)}%
                                  </div>
                                  {change.water && (
                                    <div className={`text-xs ${change.water >= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                      {change.water >= 0 ? '+' : ''}{change.water.toFixed(1)}%
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ])
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'chart' && (
          <>
            {/* Monthly Trends Chart */}
            {monthlyData.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Monthly Trends
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyData.map(m => ({ month: m.month, 'Electricity High': m.electricityHigh, 'Electricity Low': m.electricityLow || 0, Gas: m.gas, Water: m.water || 0 })) }>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Electricity High" stroke="#fbbf24" />
                    <Line type="monotone" dataKey="Electricity Low" stroke="#3b82f6" />
                    <Line type="monotone" dataKey="Gas" stroke="#f97316" />
                    <Line type="monotone" dataKey="Water" stroke="#06b6d4" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No monthly data available for charts.
                </p>
              </div>
            )}

            {/* Yearly Comparisons Chart */}
            {yearlySummaries.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Yearly Comparisons
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={yearlySummaries.map(y => ({ year: y.year, 'Electricity High': y.electricityHigh, 'Electricity Low': y.electricityLow || 0, Gas: y.gas, Water: y.water || 0 })) }>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Electricity High" fill="#fbbf24" />
                    <Bar dataKey="Electricity Low" fill="#3b82f6" />
                    <Bar dataKey="Gas" fill="#f97316" />
                    <Bar dataKey="Water" fill="#06b6d4" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No yearly data available for charts.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}