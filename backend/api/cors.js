// Simple CORS preflight handler
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://kiithub-frontend.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Cookie');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle OPTIONS method
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // For GET requests, return CORS diagnostic information
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: 'CORS enabled endpoint',
      cors: {
        allowOrigin: 'https://kiithub-frontend.vercel.app',
        allowMethods: 'GET, POST, OPTIONS, PUT, DELETE, PATCH',
        allowCredentials: true
      },
      timestamp: new Date().toISOString()
    });
  }
  
  // Method not allowed
  return res.status(405).json({ 
    success: false, 
    message: 'Method not allowed' 
  });
} 