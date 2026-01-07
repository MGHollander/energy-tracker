"use client";

import { useState } from "react";
import { StartNumbers } from "@/types/energy";

interface StartNumberSettingsProps {
  startNumbers: StartNumbers;
  onSaveStartNumbers: (numbers: StartNumbers) => void;
}

export default function StartNumberSettings({
  startNumbers,
  onSaveStartNumbers,
}: StartNumberSettingsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [electricityDay, setElectricityDay] = useState(startNumbers.electricityDay.toString());
  const [electricityNight, setElectricityNight] = useState(startNumbers.electricityNight.toString());
  const [gas, setGas] = useState(startNumbers.gas.toString());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (electricityDay && (isNaN(Number(electricityDay)) || Number(electricityDay) < 0)) {
      newErrors.electricityDay = "Must be a valid number";
    }

    if (electricityNight && (isNaN(Number(electricityNight)) || Number(electricityNight) < 0)) {
      newErrors.electricityNight = "Must be a valid number";
    }

    if (gas && (isNaN(Number(gas)) || Number(gas) < 0)) {
      newErrors.gas = "Must be a valid number";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSaveStartNumbers({
      electricityDay: Number(electricityDay) || 0,
      electricityNight: Number(electricityNight) || 0,
      gas: Number(gas) || 0,
    });

    setErrors({});
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Start Numbers
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Set your initial meter readings to calculate usage from your first entry
          </p>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter the meter readings as shown when you started tracking. Leave at 0 if you do not know them.
          </p>

          <div>
            <label htmlFor="startElectricityDay" className="block text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-1">
              Electricity Day Start (kWh)
            </label>
            <input
              type="number"
              id="startElectricityDay"
              value={electricityDay}
              onChange={(e) => setElectricityDay(e.target.value)}
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.electricityDay && <p className="text-red-500 text-sm mt-1">{errors.electricityDay}</p>}
          </div>

          <div>
            <label htmlFor="startElectricityNight" className="block text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">
              Electricity Night Start (kWh)
            </label>
            <input
              type="number"
              id="startElectricityNight"
              value={electricityNight}
              onChange={(e) => setElectricityNight(e.target.value)}
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.electricityNight && <p className="text-red-500 text-sm mt-1">{errors.electricityNight}</p>}
          </div>

          <div>
            <label htmlFor="startGas" className="block text-sm font-medium text-orange-700 dark:text-orange-400 mb-1">
              Gas Start (m³)
            </label>
            <input
              type="number"
              id="startGas"
              value={gas}
              onChange={(e) => setGas(e.target.value)}
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.gas && <p className="text-red-500 text-sm mt-1">{errors.gas}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Save Start Numbers
          </button>
        </form>
      )}
    </div>
  );
}
