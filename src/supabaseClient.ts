import { createClient } from '@supabase/supabase-js';

// Configuración directa (temporal para solucionar el problema)
const supabaseUrl = 'https://fljwovuoeasiwzurlgzz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsandvdnVvZWFzaXd6dXJsZ3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NTcwNzYsImV4cCI6MjA3MTUzMzA3Nn0.0gxTvZpOXZH2t6f_wbEZOzRlubx6E5A5ktdphfpmDSY';
// Debug: verificar que las variables se cargan
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? 'Loaded' : 'Missing');

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
