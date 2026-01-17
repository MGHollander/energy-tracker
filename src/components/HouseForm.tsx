import { useState, useEffect } from "react";
import { House } from "@/types/energy";
import { useCreateHouse } from "@/hooks/useCreateHouse";
import { useUpdateHouse } from "@/hooks/useUpdateHouse";

interface HouseFormProps {
  house: House | null;
  onClose: () => void;
}

export default function HouseForm({ house, onClose }: HouseFormProps) {
  const [name, setName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const { create, loading: createLoading, error: createError } = useCreateHouse();
  const { update, loading: updateLoading, error: updateError } = useUpdateHouse();

  const isEditing = !!house;
  const loading = createLoading || updateLoading;
  const error = createError || updateError;

  useEffect(() => {
    if (house) {
      setName(house.name);
      setIsDefault(house.is_default ?? false);
    } else {
      setName("");
      setIsDefault(false);
    }
  }, [house]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && house) {
      await update(house.id, { name, is_default: isDefault });
    } else {
      await create({ name, is_default: isDefault });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {isEditing ? "Edit House" : "Add House"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Set as default house
              </span>
            </label>
          </div>
          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm mb-4">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {loading ? "Saving..." : isEditing ? "Update" : "Add"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}