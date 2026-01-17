import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function useDeleteHouse() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteHouse = async (id: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from('houses')
      .delete()
      .eq('id', id);

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return { deleteHouse, loading, error };
}