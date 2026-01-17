import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';
import { EnergyReading, EnergyReadingInput } from '../types/energy';
import { addEnergyReading } from '../actions/addEnergyReading';

type EnergyReadingRow = {
  id: string;
  user_id: string;
  house_id: string;
  date: string;
  electricity_day: number;
  electricity_night: number;
  gas: number;
  created_at: string;
  updated_at: string;
};

const transformRowToReading = (row: EnergyReadingRow): EnergyReading => ({
  id: row.id,
  date: row.date,
  electricityDay: row.electricity_day,
  electricityNight: row.electricity_night,
  gas: row.gas,
  user_id: row.user_id,
  house_id: row.house_id,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

type PartialEnergyReadingRow = Partial<Pick<EnergyReadingRow, 'date' | 'electricity_day' | 'electricity_night' | 'gas' | 'house_id'>>;

export function useEnergyReadings(houseId?: string) {
  const { user } = useAuth();
  const [readings, setReadings] = useState<EnergyReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteReading = async (id: string) => {
    setDeleteLoading(true);
    setDeleteError(null);
    const { error } = await supabase
      .from('energy_readings')
      .delete()
      .eq('id', id);

    if (error) {
      setDeleteError(error.message);
    } else {
      setReadings(prev => prev.filter(r => r.id !== id));
    }
    setDeleteLoading(false);
  };

  useEffect(() => {
    if (!user) {
      setReadings([]);
      setLoading(false);
      return;
    }

    const fetchReadings = async () => {
      setLoading(true);
      let query = supabase
        .from('energy_readings')
        .select('*')
        .eq('user_id', user.id);
      
      if (houseId) {
        query = query.eq('house_id', houseId);
      }
      
      const { data, error } = await query.order('date', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setReadings(data.map(transformRowToReading));
        setError(null);
      }
      setLoading(false);
    };

    fetchReadings();

    // Subscribe to changes
    const channel = supabase
      .channel('energy_readings_changes_v2')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'energy_readings',
        },
        (payload) => {
          // Only process changes for the current user
          if (payload.new && (payload.new as EnergyReadingRow).user_id !== user.id) {
            return;
          }
          if (payload.old && payload.eventType === 'DELETE' && (payload.old as EnergyReadingRow).user_id !== user.id) {
            return;
          }
          // Filter by house_id if specified
          if (houseId) {
            if (payload.new && (payload.new as EnergyReadingRow).house_id !== houseId) {
              return;
            }
            if (payload.old && payload.eventType === 'DELETE' && (payload.old as EnergyReadingRow).house_id !== houseId) {
              return;
            }
          }
          if (payload.eventType === 'INSERT') {
            setReadings(prev => [...prev, transformRowToReading(payload.new as EnergyReadingRow)].sort((a, b) => a.date.localeCompare(b.date)));
          } else if (payload.eventType === 'UPDATE') {
            setReadings(prev => prev.map(r => r.id === payload.new.id ? transformRowToReading(payload.new as EnergyReadingRow) : r));
          } else if (payload.eventType === 'DELETE') {
            setReadings(prev => prev.filter(r => r.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, houseId]);

  return { readings, loading, error, deleteReading, deleteLoading, deleteError };
}

export function useCreateEnergyReading() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (reading: EnergyReadingInput) => {
    if (!user) return null;
    setLoading(true);
    setError(null);
    try {
      const data = await addEnergyReading(reading);
      setLoading(false);
      return transformRowToReading(data);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return null;
    }
  };

  return { create, loading, error };
}

export function useUpdateEnergyReading() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: string, reading: Partial<Omit<EnergyReading, 'id'>>) => {
    setLoading(true);
    setError(null);
    const updateData: PartialEnergyReadingRow = {};
    if (reading.date) updateData.date = reading.date;
    if (reading.electricityDay !== undefined) updateData.electricity_day = reading.electricityDay;
    if (reading.electricityNight !== undefined) updateData.electricity_night = reading.electricityNight;
    if (reading.gas !== undefined) updateData.gas = reading.gas;

    const { data, error } = await supabase
      .from('energy_readings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      setError(error.message);
    }
    setLoading(false);
    return data ? transformRowToReading(data) : null;
  };

  return { update, loading, error };
}