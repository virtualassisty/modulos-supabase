/**
 * Google OAuth Configuration Endpoint
 * Returns the Google Client ID for OAuth authentication
 *
 * To get a Google OAuth Client ID:
 * 1. Go to: https://console.cloud.google.com/apis/credentials
 * 2. Create a new OAuth 2.0 Client ID (Web application)
 * 3. Add authorized JavaScript origins:
 *    - https://modulos-theta.vercel.app
 *    - http://localhost:3000 (for testing)
 * 4. Add authorized redirect URIs:
 *    - https://modulos-theta.vercel.app/admin-panel.html
 * 5. Set the Client ID in Vercel environment variables:
 *    vercel env add GOOGLE_OAUTH_CLIENT_ID
 */

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get Client ID from environment variable
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;

  if (!clientId) {
    console.error('⚠️ GOOGLE_OAUTH_CLIENT_ID not configured');
    return res.status(500).json({
      error: 'OAuth not configured',
      message: 'Please set GOOGLE_OAUTH_CLIENT_ID environment variable'
    });
  }

  res.status(200).json({
    clientId: clientId,
    allowedEmail: 'virtualassist@assistify365.com'
  });
}
