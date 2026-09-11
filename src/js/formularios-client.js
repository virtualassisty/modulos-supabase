/**
 * Cliente Universal para Formularios JSONB
 * Maneja el envío de respuestas de formularios a la tabla respuestas_formularios
 * con arquitectura JSONB flexible
 */

// Validar que Supabase esté disponible
if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
  console.error('⚠️ Error: Credenciales de Supabase no configuradas. Asegúrate de cargar /api/config.js primero.');
  throw new Error('Supabase credentials not configured');
}

const supabaseFormularios = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

/**
 * Sanitiza y valida email
 * @param {string} email - Email a sanitizar
 * @returns {string|null} Email sanitizado o null si es inválido
 */
function sanitizarEmail(email) {
  if (!email || typeof email !== 'string') return null;
  const cleaned = email.trim().toLowerCase();
  // Validación básica: debe tener @ y dominio
  if (!cleaned.includes('@') || cleaned.length < 5) return null;
  return cleaned;
}

/**
 * Sanitiza y valida nombre
 * @param {string} nombre - Nombre a sanitizar
 * @returns {string|null} Nombre sanitizado o null si es inválido
 */
function sanitizarNombre(nombre) {
  if (!nombre || typeof nombre !== 'string') return null;
  const cleaned = nombre.trim();
  if (cleaned.length < 2 || cleaned.length > 100) return null;
  return cleaned;
}

/**
 * Guarda una respuesta de formulario en la base de datos
 * @param {string} formularioId - ID del formulario (ej: 'diagnostico_financiero')
 * @param {string} email - Email del usuario (será sanitizado)
 * @param {string} nombre - Nombre del usuario (será sanitizado)
 * @param {object} respuestas - Objeto JSONB con todas las respuestas del formulario
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
async function guardarFormulario(formularioId, email, nombre, respuestas) {
  try {
    // 1. Validar y sanitizar datos
    const emailSanitizado = sanitizarEmail(email);
    if (!emailSanitizado) {
      return { success: false, error: 'Por favor ingresá un email válido' };
    }

    const nombreSanitizado = sanitizarNombre(nombre);
    if (!nombreSanitizado) {
      return { success: false, error: 'Por favor ingresá tu nombre (mínimo 2 caracteres)' };
    }

    if (!formularioId || typeof formularioId !== 'string') {
      return { success: false, error: 'ID de formulario inválido' };
    }

    if (!respuestas || typeof respuestas !== 'object') {
      return { success: false, error: 'Datos de respuestas inválidos' };
    }

    // 2. Preparar datos para inserción
    const dataToInsert = {
      formulario_id: formularioId,
      email: emailSanitizado,
      nombre: nombreSanitizado,
      respuestas: respuestas
    };

    // 3. Insertar en Supabase
    console.log('📝 Guardando formulario:', formularioId);
    const { data, error } = await supabaseFormularios
      .from('respuestas_formularios')
      .insert([dataToInsert])
      .select()
      .single();

    if (error) {
      console.error('❌ Error al guardar formulario:', error);
      return {
        success: false,
        error: 'No pudimos guardar tus respuestas. Por favor intentá nuevamente.'
      };
    }

    console.log('✅ Formulario guardado exitosamente:', data.id);
    return { success: true, data: data };

  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return {
      success: false,
      error: 'Ocurrió un error inesperado. Por favor intentá nuevamente.'
    };
  }
}

/**
 * Obtiene todas las respuestas de un formulario específico
 * @param {string} formularioId - ID del formulario
 * @param {object} filters - Filtros opcionales {email?, nombre?}
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
async function obtenerRespuestas(formularioId, filters = {}) {
  try {
    let query = supabaseFormularios
      .from('respuestas_formularios')
      .select('*')
      .eq('formulario_id', formularioId)
      .order('created_at', { ascending: false });

    if (filters.email) {
      query = query.eq('email', filters.email.trim().toLowerCase());
    }

    if (filters.nombre) {
      query = query.ilike('nombre', `%${filters.nombre}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error al obtener respuestas:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data };

  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verifica si un formulario debe guardar datos en la BD
 * Módulos 1-4: SÍ guardan
 * Módulos 5-6: NO guardan
 * @param {string} formularioId - ID del formulario
 * @returns {boolean}
 */
function debeGuardarEnBD(formularioId) {
  const formulariosConBD = [
    'diagnostico_financiero',
    'diagnostico_roles',
    'inventario_semanal',
    'diagnostico_delegacion'
  ];

  return formulariosConBD.includes(formularioId);
}

// Exportar funciones para uso global
window.guardarFormulario = guardarFormulario;
window.obtenerRespuestas = obtenerRespuestas;
window.debeGuardarEnBD = debeGuardarEnBD;
window.sanitizarEmail = sanitizarEmail;
window.sanitizarNombre = sanitizarNombre;
