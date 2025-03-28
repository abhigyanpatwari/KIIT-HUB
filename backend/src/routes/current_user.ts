// Importing required libraries
import express, { Request, Response } from 'express';
import User from '../models/userSchema';
import { Session } from 'express-session';
import session_Authenticate from '../middlewares/session_authenticate';

// Define extended request interface
interface ExtendedRequest extends Request {
  userID?: string;
  session: Session & {
    userID?: string;
  };
}

// Using Express Router Class
const router = express.Router();

// Get current user information based on session
router.get('/', session_Authenticate, async (req: ExtendedRequest, res: Response) => {
  try {
    console.log('Current user request received');
    
    // The session_Authenticate middleware should have verified the session and set userID
    if (!req.userID) {
      console.error('User ID not found in authenticated request');
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }
    
    console.log('Fetching user data for ID:', req.userID);
    
    // Find the user by ID
    const user = await User.findById(req.userID);
    
    if (!user) {
      console.error('User not found for ID:', req.userID);
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Remove sensitive information
    const userData = user.toObject();
    delete userData.password;
    delete userData.tokens;
    
    console.log('User found, sending data for user:', user.email_id);
    
    // Return user data
    return res.status(200).json({
      success: true,
      user: userData
    });
  } catch (err) {
    console.error('Error fetching current user:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching user data'
    });
  }
});

export default router; 