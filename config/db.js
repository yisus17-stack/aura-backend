const { createClient } = require('@supabase/supabase-js');

let supabase = null;

const connectDB = () => {
  if (supabase) return supabase;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;

  if (!url || !key) {
    console.error('⚠️ SUPABASE_URL o SUPABASE_KEY no configurados.');
    return null;
  }

  supabase = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  console.log('🟢 Supabase cliente inicializado');
  return supabase;
};

module.exports = connectDB;