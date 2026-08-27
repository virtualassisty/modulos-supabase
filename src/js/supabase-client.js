// Configuración de Supabase Client
// Las credenciales se pueden configurar via variables de entorno en producción
const SUPABASE_URL = window.SUPABASE_URL || 'https://wzimcsxlpfkzvdieicil.supabase.co';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6aW1jc3hscGZrenZkaWVpY2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyOTQyNjQsImV4cCI6MjA5OTg3MDI2NH0.A3sll8ldkWSEzvtVtoHvm4c-3YtBa1nL1IVyXXp7mTQ';

// Inicializar cliente de Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Sanitiza una cadena HTML para prevenir XSS
 * @param {string} str - String a sanitizar
 * @returns {string} String sanitizado
 */
function sanitizeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Valida formato de email (validación simple)
 * @param {string} email - Email a validar
 * @returns {boolean} true si es válido
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  // Validación simple: solo chequea que tenga @ y algo antes y después
  return email.trim().includes('@') && email.trim().length >= 5;
}

/**
 * Valida nombre (validación simple)
 * @param {string} nombre - Nombre a validar
 * @returns {boolean} true si es válido
 */
function isValidNombre(nombre) {
  if (!nombre || typeof nombre !== 'string') return false;
  // Validación simple: solo chequea que no esté vacío y tenga entre 2 y 100 caracteres
  return nombre.trim().length >= 2 && nombre.trim().length <= 100;
}

/**
 * Guarda un diagnóstico completo en Supabase
 * @param {string} tipo - 'paso1', 'paso2', 'operaciones_saludables'
 * @param {object} userData - {nombre, email, antiguedad, profesion?, tipo?, equipo?}
 * @param {array} answers - Array de respuestas seleccionadas
 * @param {array} questions - Array de preguntas del diagnóstico
 * @param {array} blockScores - Puntajes por bloque
 * @param {object} result - {total, nivel, insight, etc}
 */
async function guardarDiagnostico(tipo, userData, answers, questions, blockScores, result) {
  try {
    // Validaciones simples
    if (!isValidEmail(userData.email)) {
      return { success: false, error: 'Por favor ingresá un email válido' };
    }
    if (!isValidNombre(userData.nombre)) {
      return { success: false, error: 'Por favor ingresá tu nombre' };
    }

    if (!['paso1', 'paso2', 'operaciones_saludables'].includes(tipo)) {
      return { success: false, error: 'Tipo de diagnóstico inválido' };
    }

    // Sanitizar datos
    const sanitizedData = {
      tipo: tipo,
      nombre: sanitizeHTML(userData.nombre.trim()),
      email: userData.email.trim().toLowerCase(),
      antiguedad: userData.antiguedad.trim(),
      puntaje_total: parseInt(result.total) || 0,
      nivel: sanitizeHTML(result.nivel || ''),
      resultados: {
        blockScores: Array.isArray(blockScores) ? blockScores : [],
        blockNames: Array.isArray(result.blockNames) ? result.blockNames : [],
        insight: sanitizeHTML(result.insight || ''),
        // Campos adicionales para operaciones_saludables
        profesion: userData.profesion ? sanitizeHTML(userData.profesion.trim()) : undefined,
        tipoPractica: userData.tipo ? sanitizeHTML(userData.tipo.trim()) : undefined,
        tieneEquipo: userData.equipo ? sanitizeHTML(userData.equipo.trim()) : undefined,
        ...result.extra
      }
    };

    // 1. Insertar registro principal
    const { data: diagnostico, error: errorDiagnostico } = await supabaseClient
      .from('diagnosticos')
      .insert([sanitizedData])
      .select()
      .single();

    if (errorDiagnostico) {
      console.error('Error al guardar diagnóstico:', errorDiagnostico);
      return { success: false, error: errorDiagnostico };
    }

    // 2. Insertar respuestas individuales
    const respuestas = answers.map((answerIndex, i) => {
      if (answerIndex === null) return null;
      const q = questions[i];
      return {
        diagnostico_id: diagnostico.id,
        pregunta_index: i,
        bloque: q.block,
        respuesta_index: answerIndex,
        respuesta_texto: q.opts[answerIndex],
        puntos: q.pts[answerIndex]
      };
    }).filter(r => r !== null);

    const { error: errorRespuestas } = await supabaseClient
      .from('respuestas')
      .insert(respuestas);

    if (errorRespuestas) {
      console.error('Error al guardar respuestas:', errorRespuestas);
      return { success: false, error: errorRespuestas };
    }

    console.log('✅ Diagnóstico guardado exitosamente:', diagnostico.id);
    return { success: true, id: diagnostico.id, data: diagnostico };

  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error: error };
  }
}

/**
 * Consulta diagnósticos de un usuario por email
 * @param {string} email - Email del usuario
 * @param {string} tipo - (Opcional) Filtrar por tipo de diagnóstico
 */
async function obtenerDiagnosticos(email, tipo = null) {
  try {
    let query = supabaseClient
      .from('diagnosticos')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener diagnósticos:', error);
      return { success: false, error: error };
    }

    return { success: true, data: data };

  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error: error };
  }
}
