/**
 * /api/admin/respuestas - Authenticated Proxy to Supabase
 *
 * Endpoint PROTEGIDO que verifica sesión antes de acceder a Supabase.
 * Usa SERVICE_ROLE_KEY para bypass de RLS (solo accesible desde servidor).
 */

import { createClient } from '@supabase/supabase-js';
import { verifySession } from '../auth/verify.js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
  // ✅ VERIFICAR SESIÓN ANTES DE PROCESAR
  const user = await verifySession(req);

  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Debes iniciar sesión para acceder a este recurso'
    });
  }

  // Verificar que sea admin (por si agregamos roles en el futuro)
  if (user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'No tienes permisos para acceder a este recurso'
    });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({
      error: 'Server misconfiguration',
      message: 'Supabase no está configurado correctamente'
    });
  }

  // ✅ CREAR CLIENTE SUPABASE CON SERVICE_ROLE_KEY (server-side only)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // GET - Listar todas las respuestas
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('respuestas_formularios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data
      });
    }

    // POST - Crear nueva respuesta (por si se necesita en el futuro)
    if (req.method === 'POST') {
      const { data, error } = await supabase
        .from('respuestas_formularios')
        .insert([req.body])
        .select();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        data: data
      });
    }

    // PATCH - Actualizar respuesta
    if (req.method === 'PATCH') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'ID requerido' });
      }

      const { data, error } = await supabase
        .from('respuestas_formularios')
        .update(req.body)
        .eq('id', id)
        .select();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data
      });
    }

    // DELETE - Eliminar respuesta
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'ID requerido' });
      }

      const { error } = await supabase
        .from('respuestas_formularios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: 'Respuesta eliminada'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('❌ Error en /api/admin/respuestas:', error);
    return res.status(500).json({
      error: 'Database error',
      message: error.message
    });
  }
}
