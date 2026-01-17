import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';
import { House } from '../types/energy';

type HouseInput = Omit<House, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

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

export function useCreateHouse() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (house: HouseInput) => {
    if (!user) return null;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('houses')
      .insert({
        user_id: user.id,
        name: house.name,
        is_default: house.is_default,
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
      setLoading(false);
      return null;
    }
    setLoading(false);
    return transformRowToHouse(data);
  };

  return { create, loading, error };
}