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
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} true si es válido
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) && email.length <= 254;
}

/**
 * Valida nombre (solo letras, espacios, acentos)
 * @param {string} nombre - Nombre a validar
 * @returns {boolean} true si es válido
 */
function isValidNombre(nombre) {
  if (!nombre || typeof nombre !== 'string') return false;
  // Permite letras (con acentos), espacios, guiones, apóstrofes y puntos
  const nombreRegex = /^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s\-'.]{2,100}$/;
  return nombreRegex.test(nombre.trim());
}

/**
 * Guarda un diagnóstico completo en Supabase
 * @param {string} tipo - 'modulo1' o 'paso2'
 * @param {object} userData - {nombre, email, antiguedad}
 * @param {array} answers - Array de respuestas seleccionadas
 * @param {array} questions - Array de preguntas del diagnóstico
 * @param {array} blockScores - Puntajes por bloque
 * @param {object} result - {total, nivel, insight, etc}
 */
async function guardarDiagnostico(tipo, userData, answers, questions, blockScores, result) {
  try {
    // Validaciones de seguridad
    if (!isValidEmail(userData.email)) {
      return { success: false, error: 'Email inválido' };
    }
    if (!isValidNombre(userData.nombre)) {
      return { success: false, error: 'Nombre inválido (solo letras y espacios)' };
    }
    
    if (!['paso1', 'paso2'].includes(tipo)) {
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
