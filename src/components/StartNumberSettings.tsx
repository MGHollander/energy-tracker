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
  const [isEditing, setIsEditing] = useState(false);
  const [electricityDay, setElectricityDay] = useState(startNumbers.electricityDay.toString());
  const [electricityNight, setElectricityNight] = useState(startNumbers.electricityNight.toString());
  const [gas, setGas] = useState(startNumbers.gas.toString());

  const handleSave = () => {
    onSaveStartNumbers({
      electricityDay: parseFloat(electricityDay) || 0,
      electricityNight: parseFloat(electricityNight) || 0,
      gas: parseFloat(gas) || 0,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setElectricityDay(startNumbers.electricityDay.toString());
    setElectricityNight(startNumbers.electricityNight.toString());
    setGas(startNumbers.gas.toString());
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Initial Meter Readings
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Starting values before your first logged reading
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md transition-colors"
          >
            Edit
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">
              Electricity Day
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {startNumbers.electricityDay.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">kWh</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
              Electricity Night
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {startNumbers.electricityNight.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">kWh</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-orange-700 dark:text-orange-400 font-medium">
              Gas
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {startNumbers.gas.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">m³</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
        Edit Initial Meter Readings
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Set the meter readings at the start of tracking.
      </p>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="startElectricityDay"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Electricity Day - Initial Reading (kWh)
          </label>
          <input
            type="number"
            id="startElectricityDay"
            value={electricityDay}
            onChange={(e) => setElectricityDay(e.target.value)}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="startElectricityNight"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Electricity Night - Initial Reading (kWh)
          </label>
          <input
            type="number"
            id="startElectricityNight"
            value={electricityNight}
            onChange={(e) => setElectricityNight(e.target.value)}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="startGas"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Gas - Initial Reading (m³)
          </label>
          <input
            type="number"
            id="startGas"
            value={gas}
            onChange={(e) => setGas(e.target.value)}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
