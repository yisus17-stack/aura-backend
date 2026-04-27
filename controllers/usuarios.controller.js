const supabaseClient = require('../config/db');
const { registrarLog } = require('../utils/logger');

const OWNER_EMAIL = 'esquivelyisus17@gmail.com';

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
  const { id } = req.params;
  const requesterEmail = req.user.email;
  const supabase = supabaseClient();

  if (!supabase) {
    return res.status(503).json({ error: 'La base de datos no está disponible' });
  }

  // 🛡️ SOLO EL DUEÑO PUEDE ELIMINAR USUARIOS
  if (requesterEmail !== OWNER_EMAIL) {
    registrarLog('SECURITY_VIOLATION', requesterEmail, 'warning', 'Intento de eliminación sin ser Super Admin');
    return res.status(403).json({ error: 'Solo el Super Admin puede eliminar usuarios' });
  }

  try {
    // Verificar si se está intentando eliminar al propio dueño
    const { data: targetUser } = await supabase.from('usuarios').select('email').eq('id', id).single();
    
    if (targetUser?.email === OWNER_EMAIL) {
      registrarLog('SECURITY_VIOLATION', requesterEmail, 'warning', 'Intento de eliminar al dueño del sistema');
      return res.status(403).json({ error: 'No se puede eliminar al dueño del sistema' });
    }

    const { error } = await supabase.from('usuarios').delete().eq('id', id);

    if (error) throw error;

    registrarLog('DELETE_USUARIO', requesterEmail, 'success', `Usuario ${id} eliminado`);
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('🔴 Error en DELETE_USUARIO:', error.message);
    registrarLog('DELETE_USUARIO', requesterEmail, 'error', error.message);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

exports.updateRol = async (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;
  const requesterEmail = req.user.email;
  const supabase = supabaseClient();

  console.log(`🔍 INTENTO CAMBIO ROL: de ${requesterEmail} para usuario ID ${id} a rol ${rol}`);

  // 🛡️ SOLO EL DUEÑO PUEDE CAMBIAR ROLES
  if (requesterEmail !== OWNER_EMAIL) {
    console.warn(`🚫 ACCESO DENEGADO: ${requesterEmail} no es el dueño`);
    registrarLog('SECURITY_VIOLATION', requesterEmail, 'warning', 'Intento de cambio de rol sin ser Super Admin');
    return res.status(403).json({ error: 'Solo el Super Admin puede gestionar roles' });
  }

  try {
    const { data: targetUser, error: fetchError } = await supabase.from('usuarios').select('email').eq('id', id).single();
    
    if (fetchError) {
      console.error('❌ ERROR AL BUSCAR USUARIO DESTINO:', fetchError.message);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log(`🎯 USUARIO DESTINO ENCONTRADO: ${targetUser.email}`);

    // El dueño no puede quitarse su propio rol de admin para no quedar fuera
    if (targetUser.email === OWNER_EMAIL && rol !== 'admin') {
      console.warn('🚫 BLOQUEO: Intento de degradar al dueño');
      return res.status(400).json({ error: 'El dueño no puede degradar su propio rol' });
    }

    const { error: updateError } = await supabase.from('usuarios').update({ rol }).eq('id', id);
    if (updateError) throw updateError;

    console.log('✅ ROL ACTUALIZADO CON ÉXITO');
    registrarLog('UPDATE_ROLE', requesterEmail, 'success', `Rol de usuario ${id} cambiado a ${rol}`);
    res.json({ mensaje: 'Rol actualizado correctamente' });
  } catch (error) {
    console.error('🔴 ERROR CRÍTICO EN UPDATE_ROL:', error.message);
    registrarLog('UPDATE_ROL', requesterEmail, 'error', error.message);
    res.status(500).json({ error: 'Error interno al actualizar el rol' });
  }
};