"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { EnergyReading, EnergyReadingInput } from "@/types/energy";

interface EnergyInputFormProps {
  onAddReading: (reading: EnergyReadingInput) => Promise<void>;
  lastReading: EnergyReading | null;
  editingReading: EnergyReading | null;
  onUpdateReading: (reading: EnergyReading) => Promise<void>;
  onCancelEdit: () => void;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function EnergyInputForm({
  onAddReading,
  lastReading,
  editingReading,
  onUpdateReading,
  onCancelEdit,
}: EnergyInputFormProps) {
  const [date, setDate] = useState("");
  const [electricityDay, setElectricityDay] = useState("");
  const [electricityNight, setElectricityNight] = useState("");
  const [gas, setGas] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingReading) {
      setDate(editingReading.date);
      setElectricityDay(editingReading.electricityDay.toString());
      setElectricityNight(editingReading.electricityNight.toString());
      setGas(editingReading.gas.toString());
    } else {
      // Set default date to first day of current month
      const now = new Date();
      setDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`);

      // Pre-fill with last reading values
      if (lastReading) {
        setElectricityDay(lastReading.electricityDay.toString());
        setElectricityNight(lastReading.electricityNight.toString());
        setGas(lastReading.gas.toString());
      } else {
        setElectricityDay("");
        setElectricityNight("");
        setGas("");
      }
    }
  }, [editingReading, lastReading]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!date) {
      newErrors.date = "Date is required";
    }

    if (!electricityDay || isNaN(Number(electricityDay)) || Number(electricityDay) < 0) {
      newErrors.electricityDay = "Valid electricity day reading is required";
    }

    if (!electricityNight || isNaN(Number(electricityNight)) || Number(electricityNight) < 0) {
      newErrors.electricityNight = "Valid electricity night reading is required";
    }

    if (!gas || isNaN(Number(gas)) || Number(gas) < 0) {
      newErrors.gas = "Valid gas reading is required";
    }

    // Check if readings are higher than previous (for non-first readings)
    if (lastReading && !editingReading) {
      if (Number(electricityDay) < lastReading.electricityDay) {
        newErrors.electricityDay = "Electricity day reading must be higher than previous";
      }
      if (Number(electricityNight) < lastReading.electricityNight) {
        newErrors.electricityNight = "Electricity night reading must be higher than previous";
      }
      if (Number(gas) < lastReading.gas) {
        newErrors.gas = "Gas reading must be higher than previous";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const reading: EnergyReadingInput = {
        date,
        electricityDay: Number(electricityDay),
        electricityNight: Number(electricityNight),
        gas: Number(gas),
      };

      if (editingReading) {
        await onUpdateReading({ ...reading, id: editingReading.id } as EnergyReading);
      } else {
        await onAddReading(reading);
      }

      // Reset form with new default values
      const now = new Date();
      setDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`);
      setElectricityDay(reading.electricityDay.toString());
      setElectricityNight(reading.electricityNight.toString());
      setGas(reading.gas.toString());
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month] = dateStr.split("-");
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div id="energy-form" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        {editingReading ? "Edit Reading" : "Add New Reading"}
      </h2>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Enter the meter readings as shown on your meters. Usage will be calculated automatically.
      </p>

      {lastReading && !editingReading && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 mb-4">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Last reading:</strong> {formatDisplayDate(lastReading.date)}
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Day: {lastReading.electricityDay.toFixed(2)} | Night: {lastReading.electricityNight.toFixed(2)} | Gas: {lastReading.gas.toFixed(2)}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
        </div>

        <div>
          <label htmlFor="electricityDay" className="block text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-1">
            Electricity Day (kWh)
          </label>
          <input
            type="number"
            id="electricityDay"
            value={electricityDay}
            onChange={(e) => setElectricityDay(e.target.value)}
            step="0.01"
            min="0"
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          {errors.electricityDay && <p className="text-red-500 text-sm mt-1">{errors.electricityDay}</p>}
        </div>

        <div>
          <label htmlFor="electricityNight" className="block text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">
            Electricity Night (kWh)
          </label>
          <input
            type="number"
            id="electricityNight"
            value={electricityNight}
            onChange={(e) => setElectricityNight(e.target.value)}
            step="0.01"
            min="0"
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          {errors.electricityNight && <p className="text-red-500 text-sm mt-1">{errors.electricityNight}</p>}
        </div>

        <div>
          <label htmlFor="gas" className="block text-sm font-medium text-orange-700 dark:text-orange-400 mb-1">
            Gas (m³)
          </label>
          <input
            type="number"
            id="gas"
            value={gas}
            onChange={(e) => setGas(e.target.value)}
            step="0.01"
            min="0"
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          {errors.gas && <p className="text-red-500 text-sm mt-1">{errors.gas}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {isSubmitting ? "Saving..." : (editingReading ? "Update Reading" : "Add Reading")}
          </button>
          {editingReading && (
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
