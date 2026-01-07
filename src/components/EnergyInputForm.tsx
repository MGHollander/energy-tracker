"use client";

import { useState } from "react";
import { EnergyReading } from "@/types/energy";

interface EnergyInputFormProps {
  onAddReading: (reading: Omit<EnergyReading, "id">) => void;
  lastReading: EnergyReading | null;
}

export default function EnergyInputForm({ onAddReading, lastReading }: EnergyInputFormProps) {
  const [date, setDate] = useState("");
  const [electricityDay, setElectricityDay] = useState("");
  const [electricityNight, setElectricityNight] = useState("");
  const [gas, setGas] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const reading: Omit<EnergyReading, "id"> = {
      date: date,
      electricityDay: parseFloat(electricityDay) || 0,
      electricityNight: parseFloat(electricityNight) || 0,
      gas: parseFloat(gas) || 0,
    };

    onAddReading(reading);
    setDate("");
    setElectricityDay("");
    setElectricityNight("");
    setGas("");
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Log Energy Usage
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="electricityDay"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Electricity Day (kWh)
            </label>
            <input
              type="number"
              id="electricityDay"
              value={electricityDay}
              onChange={(e) => setElectricityDay(e.target.value)}
              step="0.01"
              min="0"
              placeholder={lastReading ? `Last: ${lastReading.electricityDay}` : "0"}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="electricityNight"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Electricity Night (kWh)
            </label>
            <input
              type="number"
              id="electricityNight"
              value={electricityNight}
              onChange={(e) => setElectricityNight(e.target.value)}
              step="0.01"
              min="0"
              placeholder={lastReading ? `Last: ${lastReading.electricityNight}` : "0"}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="gas"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Gas (m³)
          </label>
          <input
            type="number"
            id="gas"
            value={gas}
            onChange={(e) => setGas(e.target.value)}
            step="0.01"
            min="0"
            placeholder={lastReading ? `Last: ${lastReading.gas}` : "0"}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add Reading
        </button>
      </form>
    </div>
  );
}
