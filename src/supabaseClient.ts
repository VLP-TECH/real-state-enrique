import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const deleteAsset = async (assetId: string) => {
  const { data, error } = await supabase
    .from('assets')
    .delete()
    .match({ id: assetId });

  if (error) {
    console.error('Error deleting asset:', error);
    throw error;
  }

  return data;
};
