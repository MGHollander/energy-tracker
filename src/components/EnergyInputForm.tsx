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
  houseId: string;
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
  houseId,
}: EnergyInputFormProps) {
  const [date, setDate] = useState("");
  const [electricityHigh, setElectricityHigh] = useState("");
  const [electricityLow, setElectricityLow] = useState("");
  const [gas, setGas] = useState("");
  const [water, setWater] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingReading) {
      setDate(editingReading.date);
      setElectricityHigh(editingReading.electricityHigh.toString());
      setElectricityLow(editingReading.electricityLow?.toString() || "");
      setGas(editingReading.gas.toString());
      setWater(editingReading.water?.toString() || "");
    } else {
      // Set default date to today
      const now = new Date();
      setDate(now.toISOString().split('T')[0]);

      // Always start with empty fields
      setElectricityHigh("");
      setElectricityLow("");
      setGas("");
      setWater("");
    }
  }, [editingReading, lastReading]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!date) {
      newErrors.date = "Date is required";
    }

    if (!electricityHigh || isNaN(Number(electricityHigh)) || Number(electricityHigh) < 0) {
      newErrors.electricityHigh = "Valid electricity high reading is required";
    }

    if (electricityLow && (isNaN(Number(electricityLow)) || Number(electricityLow) < 0)) {
      newErrors.electricityLow = "Electricity low reading must be a non-negative number";
    }

    if (!gas || isNaN(Number(gas)) || Number(gas) < 0) {
      newErrors.gas = "Valid gas reading is required";
    }

    if (water && (isNaN(Number(water)) || Number(water) < 0)) {
      newErrors.water = "Water reading must be a non-negative number";
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
        electricityHigh: Number(electricityHigh),
        electricityLow: electricityLow ? Number(electricityLow) : null,
        gas: Number(gas),
        water: water ? Number(water) : null,
        house_id: houseId,
      };

      if (editingReading) {
        await onUpdateReading({ ...reading, id: editingReading.id } as EnergyReading);
      } else {
        await onAddReading(reading);
      }

      // Reset form with new default values
      setElectricityHigh("");
      setElectricityLow("");
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
          <label htmlFor="electricityHigh" className="block text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-1">
            Electricity High (kWh)
          </label>
          <input
            type="number"
            id="electricityHigh"
            value={electricityHigh}
            onChange={(e) => setElectricityHigh(e.target.value)}
            step="1"
            min="0"
            placeholder={lastReading ? lastReading.electricityHigh.toString() : "0"}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          {errors.electricityHigh && <p className="text-red-500 text-sm mt-1">{errors.electricityHigh}</p>}
        </div>

        <div>
          <label htmlFor="electricityLow" className="block text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">
            Electricity Low (kWh) - Optional
          </label>
          <input
            type="number"
            id="electricityLow"
            value={electricityLow}
            onChange={(e) => setElectricityLow(e.target.value)}
            step="1"
            min="0"
            placeholder={lastReading?.electricityLow?.toString() || "0"}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.electricityLow && <p className="text-red-500 text-sm mt-1">{errors.electricityLow}</p>}
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
            step="1"
            min="0"
            placeholder={lastReading ? lastReading.gas.toString() : "0"}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          {errors.gas && <p className="text-red-500 text-sm mt-1">{errors.gas}</p>}
        </div>

        <div>
          <label htmlFor="water" className="block text-sm font-medium text-cyan-700 dark:text-cyan-400 mb-1">
            Water (m³)
          </label>
          <input
            type="number"
            id="water"
            value={water}
            onChange={(e) => setWater(e.target.value)}
            step="1"
            min="0"
            placeholder={lastReading?.water?.toString() || "0"}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.water && <p className="text-red-500 text-sm mt-1">{errors.water}</p>}
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
