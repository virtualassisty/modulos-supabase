/**
 * /api/auth/logout - Logout Endpoint
 *
 * Invalida la sesión eliminando la cookie httpOnly.
 */

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Eliminar cookie (Max-Age=0)
  const isProduction = process.env.NODE_ENV === 'production' ||
                       req.headers.host?.includes('vercel.app');

  res.setHeader('Set-Cookie', [
    `admin_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict${isProduction ? '; Secure' : ''}`,
  ]);

  return res.status(200).json({
    success: true,
    message: 'Sesión cerrada exitosamente'
  });
}
