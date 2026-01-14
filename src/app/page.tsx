"use client";
import { useState, useRef } from "react";
import EnergyInputForm from "@/components/EnergyInputForm";
import EnergyOverview from "@/components/EnergyOverview";
import Auth from "@/components/Auth";        // REPLACE: { Auth }
import { EnergyReading } from "@/types/energy";     // => { { EnergyReading } }
import { useAuth } from "@/lib/auth-context";        // REPLACE: { useAuth }
import { useEnergyReadings, useCreateEnergyReading, useUpdateEnergyReading, useDeleteEnergyReading } from "@/hooks/useEnergyReadings";    // REPLACE: { { useEnergyReadings hook replaced by { variant hooks } }


export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { readings, loading: readingsLoading, error: readingsError } = useEnergyReadings();
  const { create, loading: createLoading, error: createError } = useCreateEnergyReading();
  const { update, loading: updateLoading, error: updateError } = useUpdateEnergyReading();
  const { deleteReading, loading: deleteLoading, error: deleteError } = useDeleteEnergyReading();
  const [editingReading, setEditingReading] = useState<EnergyReading | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);


  const handleAddReading = async (reading: Omit<EnergyReading, "id">) => {
    await create(reading);
  };

  const handleUpdateReading = async (reading: EnergyReading) => {
    await update(reading.id, reading);
    setEditingReading(null);
  };

  const handleDeleteReading = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId) {
      await deleteReading(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const handleEditWithScroll = (reading: EnergyReading) => {
    setEditingReading(reading);
    scrollToForm();
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const lastReading = readings.length > 0
    ? readings.reduce((latest, current) =>
      current.date > latest.date ? current : latest
    )
    : null;

  if (authLoading) {
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

  if (!user) {
    return (
      <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Auth />
      </main>
    );
  }

  if (readingsLoading) {
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Energy Tracker
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track your electricity and gas usage over time
              </p>
            </div>
            <Auth />
          </div>
        </header>

        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
              <p className="text-gray-900 dark:text-white mb-6">Are you sure you want to delete this reading?</p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={cancelDelete}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" ref={formRef}>
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
                  {lastReading ? lastReading.electricityDay.toFixed(2) : "0.00"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700 dark:text-blue-400 font-medium">
                  Electricity Night
                </span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {lastReading ? lastReading.electricityNight.toFixed(2) : "0.00"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-orange-700 dark:text-orange-400 font-medium">
                  Gas
                </span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {lastReading ? lastReading.gas.toFixed(2) : "0.00"}
                </span>
              </div>
            </div>
          </div>

        </div>

        <EnergyOverview
          readings={readings}
          onEdit={handleEditWithScroll}
          onDelete={handleDeleteReading}
        />
      </div>
    </main>
  );
}
