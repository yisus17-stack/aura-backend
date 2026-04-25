const { createClient } = require('@supabase/supabase-js');

let supabase = null;

const connectDB = () => {
  if (supabase) return supabase;

  const url = process.env.SUPABASE_URL;
  // Ajustado para que coincida con tu .env
  const key = process.env.SUPABASE_ANON_KEY; 

  if (!url || !key) {
    console.error('⚠️ SUPABASE_URL o SUPABASE_ANON_KEY no configurados.');
    return null;
  }

  supabase = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  console.log('🟢 Cliente de Supabase inicializado correctamente');
  return supabase;
};

module.exports = connectDB;