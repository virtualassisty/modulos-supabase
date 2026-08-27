// API endpoint para inyectar variables de entorno en el cliente
export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  const config = `
window.SUPABASE_URL = '${process.env.SUPABASE_URL || ''}';
window.SUPABASE_ANON_KEY = '${process.env.SUPABASE_ANON_KEY || ''}';
`;

  res.status(200).send(config);
}
