"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useHouses } from "@/hooks/useHouses";
import { useDeleteHouse } from "@/hooks/useDeleteHouse";
import Auth from "@/components/Auth";
import HouseList from "@/components/HouseList";
import HouseForm from "@/components/HouseForm";
import { House } from "@/types/energy";

export default function HousesPage() {
  const { user, loading: authLoading } = useAuth();
  const { houses, loading: housesLoading, error: housesError } = useHouses();
  const { deleteHouse, loading: deleteLoading, error: deleteError } = useDeleteHouse();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState<House | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleAddHouse = () => {
    setEditingHouse(null);
    setIsModalOpen(true);
  };

  const handleEditHouse = (house: House) => {
    setEditingHouse(house);
    setIsModalOpen(true);
  };

  const handleDeleteHouse = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId) {
      await deleteHouse(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingHouse(null);
  };

  if (authLoading) {
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

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Houses
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your houses
              </p>
            </div>
            <button
              onClick={handleAddHouse}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Add House
            </button>
          </div>
        </header>

        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
              <p className="text-gray-900 dark:text-white mb-6">Are you sure you want to delete this house?</p>
              {deleteError && (
                <p className="text-red-600 dark:text-red-400 text-sm mb-4">
                  {deleteError}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
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

        {housesLoading ? (
          <p className="text-center text-gray-600 dark:text-gray-400">
            Loading houses...
          </p>
        ) : housesError ? (
          <p className="text-center text-red-600 dark:text-red-400">
            Error: {housesError}
          </p>
        ) : (
          <HouseList houses={houses} onEdit={handleEditHouse} onDelete={handleDeleteHouse} />
        )}

        {isModalOpen && (
          <HouseForm
            house={editingHouse}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </main>
  );
}