// Serverless function for user profile
const { connect } = require('../dist/src/db/conn');
const User = require('../dist/src/models/userSchema');
const jwt = require('jsonwebtoken');

// Helper for setting CORS headers
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'https://kiithub-frontend.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
};

module.exports = async (req, res) => {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(200).end();
  }

  // Set CORS headers for all responses
  setCorsHeaders(res);

  try {
    // Connect to the database
    await connect();

    if (req.method === 'GET') {
      // Get the token from cookies
      const cookies = req.headers.cookie;
      if (!cookies) {
        return res.status(401).json({ 
          success: false,
          message: 'Authorization required' 
        });
      }

      const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('jwtoken='));
      if (!tokenCookie) {
        return res.status(401).json({ 
          success: false,
          message: 'Token not found' 
        });
      }

      const token = tokenCookie.split('=')[1];
      
      // Verify the token
      const verifyToken = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
      
      // Find the user
      const user = await User.findOne({ _id: verifyToken._id, "tokens.token": token });
      
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      // Return user data
      return res.status(200).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email_id: user.email_id,
          college_name: user.college_name || 'KIIT University',
          list: user.list || []
        }
      });
    } else {
      // Method not allowed
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
    }
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}; 