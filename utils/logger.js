const supabaseClient = require('../config/db');

const getSupabase = () => {
  const supabase = supabaseClient();
  if (!supabase) {
    console.log('⚠️ Supabase no disponible para logs');
  }
  return supabase;
};

function registrarLog(accion, usuario, status, detalles = '') {
  const supabase = getSupabase();
  const log = {
    accion,
    usuario: usuario || 'desconocido',
    status: status || 'success',
    detalles,
    timestamp: new Date().toISOString()
  };

  if (!supabase) {
    console.log(`[LOG] ${accion} - ${usuario} - ${status} - ${detalles}`);
    return;
  }

  supabase
    .from('logs')
    .insert([log])
    .then(({ error }) => {
      if (error) {
        console.error('Error guardando log en Supabase:', error.message);
      }
    })
    .catch((error) => {
      console.error('Error guardando log en Supabase:', error.message);
    });
}

async function obtenerLogs(limit = 100) {
  const supabase = getSupabase();
  if (!supabase) {
    return [];
  }

  const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 500));

  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(safeLimit);

  if (error) {
    console.error('Error obteniendo logs de Supabase:', error.message);
    return [];
  }

  return data || [];
}

module.exports = { registrarLog, obtenerLogs };
