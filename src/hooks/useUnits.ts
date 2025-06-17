
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Unit {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export const useUnits = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching units:', error);
        return;
      }

      setUnits(data || []);
    } catch (error) {
      console.error('Error in fetchUnits:', error);
    } finally {
      setLoading(false);
    }
  };

  const addUnit = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('units')
        .insert([{ name }])
        .select()
        .single();

      if (error) {
        console.error('Error adding unit:', error);
        throw error;
      }

      await fetchUnits();
      return data;
    } catch (error) {
      console.error('Error in addUnit:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  return {
    units,
    loading,
    addUnit,
    fetchUnits
  };
};
