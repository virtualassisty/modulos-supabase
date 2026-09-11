/**
 * Wrapper Universal para Formularios
 * Este script agrega automáticamente funcionalidad de guardado a formularios existentes
 * sin necesidad de modificar cada uno individualmente
 */

(function() {
  'use strict';

  // Configuración de formularios por ruta
  const FORM_CONFIG = {
    '/Entregables/Modulo 1/app_diagnostico_financiero.html': {
      id: 'diagnostico_financiero',
      guardar: true,
      extraerDatos: extraerDiagnosticoFinanciero
    },
    '/Entregables/Modulo 1/app_diagnostico_roles.html': {
      id: 'diagnostico_roles',
      guardar: true,
      extraerDatos: extraerDiagnosticoRoles
    },
    '/Entregables/Modulo 2/1. inventario_semanal_m2.html': {
      id: 'inventario_semanal',
      guardar: true,
      extraerDatos: extraerInventarioSemanal
    },
    '/Entregables/Modulo 4/2. diagnostico_delegacion_m2.html': {
      id: 'diagnostico_delegacion',
      guardar: true,
      extraerDatos: extraerDiagnosticoDelegacion
    },
    '/Entregables/Modulo 5/app_contratacion_m4.html': {
      id: 'generador_busqueda',
      guardar: false, // NO guardar en BD
      extraerDatos: null
    }
  };

  // Detectar formulario actual
  function detectarFormulario() {
    const path = window.location.pathname;
    for (const [key, config] of Object.entries(FORM_CONFIG)) {
      if (path.includes(key) || path.endsWith(key.split('/').pop())) {
        return config;
      }
    }
    return null;
  }

  // Extractores de datos específicos por formulario

  function extraerDiagnosticoFinanciero() {
    const val = (id) => parseFloat(document.getElementById(id)?.value) || 0;

    const ing = val('ing1') + val('ing2') + val('ing3') + val('ing4') + val('ing5');
    const eg = val('eg1') + val('eg2') + val('eg3') + val('eg4') + val('eg5');
    const margen = ing - eg;
    const pct = ing > 0 ? Math.round((margen / ing) * 100) : 0;

    return {
      nombre: document.getElementById('user-nombre')?.value || '',
      email: document.getElementById('user-email')?.value || '',
      respuestas: {
        ingresos: {
          consultas_sesiones: val('ing1'),
          procedimientos: val('ing2'),
          venta_productos: val('ing3'),
          alquiler_consultorios: val('ing4'),
          otros_ingresos: val('ing5'),
          total: ing
        },
        gastos: {
          sueldos_honorarios: val('eg1'),
          alquiler_espacio: val('eg2'),
          insumos: val('eg3'),
          impuestos: val('eg4'),
          otros_gastos: val('eg5'),
          total: eg
        },
        resultados: {
          margen_bruto: margen,
          porcentaje_margen: pct,
          estado: pct < 20 ? 'critico' : (pct < 35 ? 'ajustado' : 'saludable')
        }
      }
    };
  }

  function extraerDiagnosticoRoles() {
    // Si existe userData global
    if (window.userData && window.answers && window.blockScores) {
      const total = window.blockScores.reduce((a, b) => a + b, 0);
      const nivel = total < 30 ? 'ejecutor' : (total < 38 ? 'lider' : 'dueno');

      return {
        nombre: window.userData.nombre || '',
        email: window.userData.email || '',
        respuestas: {
          datos_usuario: {
            profesion: window.userData.profesion,
            antiguedad: window.userData.antiguedad,
            tipo_practica: window.userData.tipo,
            tiene_equipo: window.userData.equipo
          },
          respuestas_preguntas: window.answers,
          puntajes: {
            total,
            bloque_delegacion: window.blockScores[0],
            bloque_control: window.blockScores[1],
            bloque_mentalidad: window.blockScores[2],
            nivel
          }
        }
      };
    }
    return null;
  }

  function extraerInventarioSemanal() {
    // Si existe tasks global
    if (window.tasks && Array.isArray(window.tasks)) {
      const totalHs = window.tasks.reduce((sum, t) => sum + (parseFloat(t.horas) || 0), 0);

      return {
        nombre: prompt('Por favor ingresá tu nombre completo:') || 'Usuario',
        email: prompt('Por favor ingresá tu email:') || '',
        respuestas: {
          tareas: window.tasks,
          metricas: {
            total_horas: totalHs,
            total_tareas: window.tasks.length,
            horas_clinicas: window.tasks.filter(t => t.cat === 'clinica').reduce((s, t) => s + parseFloat(t.horas), 0),
            horas_gestion: totalHs - window.tasks.filter(t => t.cat === 'clinica').reduce((s, t) => s + parseFloat(t.horas), 0)
          }
        }
      };
    }
    return null;
  }

  function extraerDiagnosticoDelegacion() {
    // Similar a diagnóstico de roles
    if (window.userData && window.answers && window.blockScores) {
      const total = window.blockScores.reduce((a, b) => a + b, 0);

      return {
        nombre: window.userData.nombre || '',
        email: window.userData.email || '',
        respuestas: {
          datos_usuario: {
            profesion: window.userData.profesion || window.userData.prof,
            tipo_practica: window.userData.tipo,
            tiene_equipo: window.userData.equipo
          },
          respuestas_preguntas: window.answers,
          puntajes: {
            total,
            bloque_que_delegar: window.blockScores[0],
            bloque_como_delegar: window.blockScores[1],
            bloque_control: window.blockScores[2]
          }
        }
      };
    }
    return null;
  }

  // Función principal de guardado
  async function guardarFormularioAutomatico() {
    const config = detectarFormulario();

    if (!config) {
      console.log('ℹ️ Formulario no configurado para guardado automático');
      return { success: false, error: 'Formulario no reconocido' };
    }

    if (!config.guardar) {
      console.log('ℹ️ Este formulario NO debe guardar datos en la BD (configurado)');
      return { success: true, skipSave: true };
    }

    if (!config.extraerDatos) {
      console.warn('⚠️ No hay función extractora configurada para este formulario');
      return { success: false, error: 'Extractor no configurado' };
    }

    try {
      const datos = config.extraerDatos();

      if (!datos) {
        console.warn('⚠️ No se pudieron extraer datos del formulario');
        return { success: false, error: 'No se pudieron extraer datos' };
      }

      if (!datos.email || !datos.nombre) {
        console.warn('⚠️ Faltan datos de usuario (nombre/email)');
        return { success: false, error: 'Datos de usuario incompletos' };
      }

      // Guardar usando la función global
      if (typeof window.guardarFormulario === 'function') {
        const resultado = await window.guardarFormulario(
          config.id,
          datos.email,
          datos.nombre,
          datos.respuestas
        );

        return resultado;
      } else {
        console.error('❌ La función guardarFormulario no está disponible');
        return { success: false, error: 'Cliente de formularios no cargado' };
      }

    } catch (error) {
      console.error('❌ Error al guardar formulario:', error);
      return { success: false, error: error.message };
    }
  }

  // Exponer funciones globalmente
  window.guardarFormularioAutomatico = guardarFormularioAutomatico;
  window.detectarFormulario = detectarFormulario;

  console.log('✅ Formularios wrapper cargado');

})();
