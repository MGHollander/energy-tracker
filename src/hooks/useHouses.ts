import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';
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
  is_default: row.is_default ?? false,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export function useHouses() {
  const { user } = useAuth();
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setHouses([]);
      setLoading(false);
      return;
    }

    const fetchHouses = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('houses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setHouses(data.map(transformRowToHouse));
        setError(null);
      }
      setLoading(false);
    };

    fetchHouses();

    // Subscribe to changes
    const channel = supabase
      .channel('houses_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'houses',
        },
        (payload) => {
          // Only process changes for the current user
          if (payload.new && (payload.new as HouseRow).user_id !== user.id) {
            return;
          }
          if (payload.old && payload.eventType === 'DELETE' && (payload.old as HouseRow).user_id !== user.id) {
            return;
          }
          if (payload.eventType === 'INSERT') {
            setHouses(prev => [...prev, transformRowToHouse(payload.new as HouseRow)].sort((a, b) => a.created_at.localeCompare(b.created_at)));
          } else if (payload.eventType === 'UPDATE') {
            setHouses(prev => prev.map(h => h.id === payload.new.id ? transformRowToHouse(payload.new as HouseRow) : h));
          } else if (payload.eventType === 'DELETE') {
            setHouses(prev => prev.filter(h => h.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { houses, loading, error };
}