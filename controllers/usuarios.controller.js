const supabaseClient = require('../config/db');
const { registrarLog } = require('../utils/logger');

exports.getUsuarios = async (req, res) => {
  const supabase = supabaseClient();
  if (!supabase) {
    return res.status(503).json({ error: 'La base de datos no está disponible' });
  }

  try {
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('id, nombre, email, rol')
      .order('nombre', { ascending: true });

    if (error) throw error;

    registrarLog('GET_USUARIOS', req.user.email, 'success');
    res.json(usuarios);
  } catch (error) {
    console.error('🔴 Error en GET_USUARIOS:', error.message);
    registrarLog('GET_USUARIOS', req.user?.email || 'desconocido', 'error', error.message);
    res.status(500).json({ error: 'Error al obtener usuarios', details: error.message });
  }
};

exports.deleteUsuario = async (req, res) => {
  const supabase = supabaseClient();
  if (!supabase) {
    return res.status(503).json({ error: 'La base de datos no está disponible' });
  }

  try {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', req.params.id)
      .single();

    if (error && error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    if (error) throw error;

    registrarLog('DELETE_USUARIO', req.user.email, 'success');
    res.json({ mensaje: 'Eliminado' });
  } catch (error) {
    console.error('🔴 Error en DELETE_USUARIO:', error.message);
    registrarLog('DELETE_USUARIO', req.user?.email || 'desconocido', 'error', error.message);
    res.status(500).json({ error: 'Error al eliminar usuario', details: error.message });
  }
};