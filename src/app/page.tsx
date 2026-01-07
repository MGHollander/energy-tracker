"use client";

import { useState, useEffect } from "react";
import EnergyInputForm from "@/components/EnergyInputForm";
import EnergyOverview from "@/components/EnergyOverview";
import StartNumberSettings from "@/components/StartNumberSettings";
import { EnergyReading, StartNumbers } from "@/types/energy";

const STORAGE_KEY_READINGS = "energy_tracker_readings";
const STORAGE_KEY_START_NUMBERS = "energy_tracker_start_numbers";

const defaultStartNumbers: StartNumbers = {
  electricityDay: 0,
  electricityNight: 0,
  gas: 0,
};

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
        <p className="text-gray-900 dark:text-white mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Delete
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Cancel
          </button>
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
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      setReadings((prev) => prev.filter((r) => r.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
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
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Energy Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your electricity and gas usage over time
          </p>
        </header>

        {deleteConfirmId && (
          <ConfirmDialog
            message="Are you sure you want to delete this reading?"
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
          />
        )}

        <StartNumberSettings
          startNumbers={startNumbers}
          onSaveStartNumbers={handleSaveStartNumbers}
        />

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
