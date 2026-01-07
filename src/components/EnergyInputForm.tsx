"use client";

import { useState, useEffect } from "react";
import { EnergyReading } from "@/types/energy";

interface EnergyInputFormProps {
  onAddReading: (reading: Omit<EnergyReading, "id">) => void;
  onUpdateReading: (reading: EnergyReading) => void;
  onCancelEdit: () => void;
  lastReading: EnergyReading | null;
  editingReading: EnergyReading | null;
}

export default function EnergyInputForm({
  onAddReading,
  onUpdateReading,
  onCancelEdit,
  lastReading,
  editingReading,
}: EnergyInputFormProps) {
  const [date, setDate] = useState("");
  const [electricityDay, setElectricityDay] = useState("");
  const [electricityNight, setElectricityNight] = useState("");
  const [gas, setGas] = useState("");

  useEffect(() => {
    if (editingReading) {
      setDate(editingReading.date);
      setElectricityDay(editingReading.electricityDay.toString());
      setElectricityNight(editingReading.electricityNight.toString());
      setGas(editingReading.gas.toString());
    } else {
      setDate("");
      setElectricityDay("");
      setElectricityNight("");
      setGas("");
    }
  }, [editingReading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingReading) {
      const reading: EnergyReading = {
        ...editingReading,
        date,
        electricityDay: parseFloat(electricityDay) || 0,
        electricityNight: parseFloat(electricityNight) || 0,
        gas: parseFloat(gas) || 0,
      };
      onUpdateReading(reading);
    } else {
      const reading: Omit<EnergyReading, "id"> = {
        date,
        electricityDay: parseFloat(electricityDay) || 0,
        electricityNight: parseFloat(electricityNight) || 0,
        gas: parseFloat(gas) || 0,
      };
      onAddReading(reading);
      setDate("");
      setElectricityDay("");
      setElectricityNight("");
      setGas("");
    }
  };

  const isEditing = !!editingReading;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        {isEditing ? "Edit Reading" : "Log Energy Usage"}
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

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isEditing ? "Update Reading" : "Add Reading"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
