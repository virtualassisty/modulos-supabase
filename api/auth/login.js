/**
 * /api/auth/login - Secure OAuth Login Endpoint
 *
 * Verifica el JWT de Google server-side y emite una sesión propia segura.
 * NO confía en nada que venga del cliente.
 */

import { OAuth2Client } from 'google-auth-library';
import { SignJWT } from 'jose';

// Lista blanca de emails autorizados (única fuente de verdad)
const ALLOWED_EMAILS = [
  'virtualassist@assistify365.com',
  'emilia@assistify365.com'
];

// Configuración
const GOOGLE_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_IN_PRODUCTION_' + Date.now();
const SESSION_MAX_AGE = 24 * 60 * 60; // 24 horas en segundos

export default async function handler(req, res) {
  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { credential, access_token } = req.body;

    if (!credential && !access_token) {
      return res.status(400).json({
        error: 'Missing credential',
        message: 'Se requiere credential (JWT) o access_token de Google'
      });
    }

    let userEmail, userName, userPicture;

    // Opción 1: Verificar JWT credential de Google
    if (credential) {
      if (!GOOGLE_CLIENT_ID) {
        return res.status(500).json({
          error: 'Server misconfiguration',
          message: 'GOOGLE_OAUTH_CLIENT_ID no configurado'
        });
      }

      // ✅ VERIFICACIÓN SERVER-SIDE del JWT de Google
      const client = new OAuth2Client(GOOGLE_CLIENT_ID);

      try {
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        userEmail = payload.email;
        userName = payload.name;
        userPicture = payload.picture;

      } catch (verifyError) {
        console.error('❌ JWT verification failed:', verifyError);
        return res.status(401).json({
          error: 'Invalid token',
          message: 'El token de Google no es válido o ha expirado'
        });
      }
    }

    // Opción 2: Usar access_token para obtener userinfo de Google
    if (access_token && !userEmail) {
      try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user info from Google');
        }

        const userInfo = await response.json();
        userEmail = userInfo.email;
        userName = userInfo.name;
        userPicture = userInfo.picture;

      } catch (fetchError) {
        console.error('❌ Failed to fetch user info:', fetchError);
        return res.status(401).json({
          error: 'Invalid access token',
          message: 'No se pudo verificar el access token con Google'
        });
      }
    }

    // ✅ VERIFICAR que el email esté en la lista blanca
    if (!ALLOWED_EMAILS.includes(userEmail)) {
      console.warn(`⚠️ Intento de acceso denegado: ${userEmail}`);
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'Tu email no tiene permisos de administrador'
      });
    }

    // ✅ EMITIR JWT PROPIO (firmado por nuestro servidor)
    const secret = new TextEncoder().encode(JWT_SECRET);

    const sessionToken = await new SignJWT({
      email: userEmail,
      name: userName,
      picture: userPicture,
      role: 'admin'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${SESSION_MAX_AGE}s`)
      .sign(secret);

    // ✅ CONFIGURAR COOKIE HTTP-ONLY (no accesible desde JavaScript)
    const isProduction = process.env.NODE_ENV === 'production' ||
                         req.headers.host?.includes('vercel.app');

    res.setHeader('Set-Cookie', [
      `admin_session=${sessionToken}; HttpOnly; Path=/; Max-Age=${SESSION_MAX_AGE}; SameSite=Strict${isProduction ? '; Secure' : ''}`,
    ]);

    console.log(`✅ Login exitoso: ${userEmail}`);

    // Devolver info del usuario (sin el token, está en la cookie)
    return res.status(200).json({
      success: true,
      user: {
        email: userEmail,
        name: userName,
        picture: userPicture
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Error al procesar el login'
    });
  }
}
