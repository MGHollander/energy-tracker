import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { House } from '../types/energy';

type HouseRow = {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

const transformRowToHouse = (row: HouseRow): House => ({
  id: row.id,
  user_id: row.user_id,
  name: row.name,
  is_default: row.is_default,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export function useUpdateHouse() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: string, house: Partial<Omit<House, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    setLoading(true);
    setError(null);
    const updateData: Partial<Pick<HouseRow, 'name' | 'is_default'>> = {};
    if (house.name !== undefined) updateData.name = house.name;
    if (house.is_default !== undefined) updateData.is_default = house.is_default;
    const { data, error } = await supabase
      .from('houses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      setError(error.message);
    }
    setLoading(false);
    return data ? transformRowToHouse(data) : null;
  };

  return { update, loading, error };
}