// CORS middleware for serverless functions
module.exports = async (req, res) => {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', 'https://kiithub-frontend.vercel.app');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Cookie');
  
  // Handle OPTIONS method directly
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return {
      handled: true
    };
  }
  
  // Continue processing for non-OPTIONS requests
  return {
    handled: false
  };
}; 