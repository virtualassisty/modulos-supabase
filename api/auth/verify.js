/**
 * /api/auth/verify - Session Verification Endpoint
 *
 * Verifica que el usuario tenga una sesión válida.
 * Usado por el frontend para check inicial y por otros endpoints como middleware.
 */

import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_IN_PRODUCTION_' + Date.now();

/**
 * Verifica la sesión desde la cookie
 * @returns {Object|null} User data si válido, null si no
 */
export async function verifySession(req) {
  try {
    // Obtener cookie
    const cookies = req.headers.cookie || '';
    const sessionCookie = cookies
      .split(';')
      .find(c => c.trim().startsWith('admin_session='));

    if (!sessionCookie) {
      return null;
    }

    const token = sessionCookie.split('=')[1];
    if (!token) {
      return null;
    }

    // Verificar JWT
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Retornar datos del usuario
    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      role: payload.role
    };

  } catch (error) {
    console.error('❌ Error verificando sesión:', error.message);
    return null;
  }
}

/**
 * Endpoint HTTP para verificar sesión
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifySession(req);

  if (!user) {
    return res.status(401).json({
      authenticated: false,
      message: 'No hay sesión activa'
    });
  }

  return res.status(200).json({
    authenticated: true,
    user: user
  });
}
