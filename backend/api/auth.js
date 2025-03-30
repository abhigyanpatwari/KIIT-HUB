// Serverless function for authentication
const { connect } = require('../dist/src/db/conn');
const User = require('../dist/src/models/userSchema');
const bcrypt = require('bcryptjs');
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

    if (req.method === 'POST') {
      const { email_id, password } = req.body;
      
      // Validate inputs
      if (!email_id || !password) {
        return res.status(400).json({ 
          success: false,
          message: 'Please enter both email and password'
        });
      }

      // Find the user
      const user = await User.findOne({ email_id });
      
      if (!user) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid Email ID. Please register before signing in'
        });
      }

      // Compare passwords
      const isMatched = await bcrypt.compare(password, user.password);
      
      if (!isMatched) {
        return res.status(403).json({ 
          success: false,
          message: 'Access Denied: Invalid Credentials'
        });
      }

      // Generate JWT token
      const token = await user.generateAuthToken();

      // Set cookie for token
      res.setHeader('Set-Cookie', `jwtoken=${token}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=2589200`);
      
      // Return success response
      return res.status(200).json({ 
        success: true,
        message: 'Login Successful',
        user: {
          _id: user._id.toString(),
          name: user.name,
          email_id: user.email_id,
          college_name: user.college_name || 'KIIT University'
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
    console.error('Auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}; 