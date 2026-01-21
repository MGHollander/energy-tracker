"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { useEnergyReadings, useCreateEnergyReading, useUpdateEnergyReading } from "@/hooks/useEnergyReadings";
import Auth from "@/components/Auth";
import EnergyInputForm from "@/components/EnergyInputForm";
import EnergyOverview from "@/components/EnergyOverview";
import { House, EnergyReading, EnergyReadingInput } from "@/types/energy";

export default function HouseReadingsPage() {
  const params = useParams();
  const houseId = params.id as string;
  const { user, loading: authLoading } = useAuth();
  const [house, setHouse] = useState<House | null>(null);
  const [houseLoading, setHouseLoading] = useState(true);
  const [houseError, setHouseError] = useState<string | null>(null);
  const [editingReading, setEditingReading] = useState<EnergyReading | null>(null);

  const { readings, loading: readingsLoading, error: readingsError, deleteReading } = useEnergyReadings(houseId);
  const { create } = useCreateEnergyReading();
  const { update } = useUpdateEnergyReading();

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

  const handleAddReading = async (reading: EnergyReadingInput) => {
    await create(reading);
  };

  const handleUpdateReading = async (reading: EnergyReading) => {
    await update(reading.id, reading);
    setEditingReading(null);
  };

  const handleEditReading = (reading: EnergyReading) => {
    setEditingReading(reading);
  };

  const handleCancelEdit = () => {
    setEditingReading(null);
  };

  const handleDeleteReading = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this reading?')) {
      await deleteReading(id);
    }
  };

  if (authLoading || houseLoading) {
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
                {house.name} Readings
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track energy consumption for {house.name}
              </p>
            </div>
          </div>
        </header>

        {/* Energy Input Form */}
        <EnergyInputForm
          onAddReading={handleAddReading}
          lastReading={readings.length > 0 ? readings[readings.length - 1] : null}
          editingReading={editingReading}
          onUpdateReading={handleUpdateReading}
          onCancelEdit={handleCancelEdit}
          houseId={houseId}
        />

        {/* Energy Overview */}
        {readingsLoading ? (
          <p className="text-center text-gray-600 dark:text-gray-400">
            Loading readings...
          </p>
        ) : readingsError ? (
          <p className="text-center text-red-600 dark:text-red-400">
            Error loading readings: {readingsError}
          </p>
        ) : (
          <EnergyOverview
            readings={readings}
            onEdit={handleEditReading}
            onDelete={handleDeleteReading}
            houseId={houseId}
          />
        )}
      </div>
    </main>
  );
}