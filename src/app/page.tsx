"use client";

import { useState, useEffect } from "react";
import EnergyInputForm from "@/components/EnergyInputForm";
import EnergyOverview from "@/components/EnergyOverview";
import { EnergyReading, StartNumbers } from "@/types/energy";

const STORAGE_KEY_READINGS = "energy_tracker_readings";
const STORAGE_KEY_START_NUMBERS = "energy_tracker_start_numbers";

const defaultStartNumbers: StartNumbers = {
  electricityDay: 0,
  electricityNight: 0,
  gas: 0,
};

function SettingsDialog({
  startNumbers,
  onSave,
  onClose,
}: {
  startNumbers: StartNumbers;
  onSave: (numbers: StartNumbers) => void;
  onClose: () => void;
}) {
  const [electricityDay, setElectricityDay] = useState(startNumbers.electricityDay.toString());
  const [electricityNight, setElectricityNight] = useState(startNumbers.electricityNight.toString());
  const [gas, setGas] = useState(startNumbers.gas.toString());

  const handleSave = () => {
    onSave({
      electricityDay: parseFloat(electricityDay) || 0,
      electricityNight: parseFloat(electricityNight) || 0,
      gas: parseFloat(gas) || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

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

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [readings, setReadings] = useState<EnergyReading[]>([]);
  const [startNumbers, setStartNumbers] = useState<StartNumbers>(defaultStartNumbers);
  const [isLoaded, setIsLoaded] = useState(false);
  const [editingReading, setEditingReading] = useState<EnergyReading | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const savedReadings = localStorage.getItem(STORAGE_KEY_READINGS);
    const savedStartNumbers = localStorage.getItem(STORAGE_KEY_START_NUMBERS);

    if (savedReadings) {
      try {
        setReadings(JSON.parse(savedReadings));
      } catch {
        console.error("Failed to parse saved readings");
      }
    }

    if (savedStartNumbers) {
      try {
        setStartNumbers(JSON.parse(savedStartNumbers));
      } catch {
        console.error("Failed to parse saved start numbers");
      }
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY_READINGS, JSON.stringify(readings));
    }
  }, [readings, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY_START_NUMBERS, JSON.stringify(startNumbers));
    }
  }, [startNumbers, isLoaded]);

  const handleAddReading = (reading: Omit<EnergyReading, "id">) => {
    const newReading: EnergyReading = {
      ...reading,
      id: `${reading.date}-${Date.now()}`,
    };
    setReadings((prev) => [...prev, newReading]);
  };

  const handleUpdateReading = (reading: EnergyReading) => {
    setReadings((prev) =>
      prev.map((r) => (r.id === reading.id ? reading : r))
    );
    setEditingReading(null);
  };

  const handleDeleteReading = (id: string) => {
    if (confirm("Are you sure you want to delete this reading?")) {
      setReadings((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleSaveStartNumbers = (numbers: StartNumbers) => {
    setStartNumbers(numbers);
  };

  const lastReading = readings.length > 0 
    ? readings.reduce((latest, current) => 
        current.date > latest.date ? current : latest
      )
    : null;

  if (!isLoaded) {
    return (
      <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Loading...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Energy Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your electricity and gas usage over time
            </p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            aria-label="Settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </header>

        {showSettings && (
          <SettingsDialog
            startNumbers={startNumbers}
            onSave={handleSaveStartNumbers}
            onClose={() => setShowSettings(false)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EnergyInputForm
            onAddReading={handleAddReading}
            lastReading={lastReading}
            editingReading={editingReading}
            onUpdateReading={handleUpdateReading}
            onCancelEdit={() => setEditingReading(null)}
          />
          
          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Current Meter Readings
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-yellow-700 dark:text-yellow-400 font-medium">
                  Electricity Day
                </span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {lastReading ? lastReading.electricityDay.toFixed(2) : startNumbers.electricityDay.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700 dark:text-blue-400 font-medium">
                  Electricity Night
                </span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {lastReading ? lastReading.electricityNight.toFixed(2) : startNumbers.electricityNight.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-orange-700 dark:text-orange-400 font-medium">
                  Gas
                </span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {lastReading ? lastReading.gas.toFixed(2) : startNumbers.gas.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <EnergyOverview
          readings={readings}
          onEdit={setEditingReading}
          onDelete={handleDeleteReading}
        />
      </div>
    </main>
  );
}
