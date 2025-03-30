// Serverless function for user profile
const connect = require('../src/config/database');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');

// Function to set CORS headers
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://kiithub-frontend.vercel.app');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
}

module.exports = async (req, res) => {
  // Handle preflight requests immediately
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(200).end();
  }
  
  // Set CORS headers for all responses
  setCorsHeaders(res);
  
  try {
    // Connect to database
    await connect();
    
    if (req.method === 'GET') {
      // Extract the token from cookie or Authorization header
      const token = req.cookies?.token || 
                   (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
      
      if (!token) {
        return res.status(401).json({ success: false, message: 'No authentication token found' });
      }
      
      try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find the user
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Return user data
        return res.status(200).json({ success: true, user });
      } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
      }
    } else {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}; 