// Importing required libraries
import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/userSchema';
import { Session } from 'express-session';

// Define extended request interface
interface ExtendedRequest extends Request {
  session: Session & {
    userID?: string;
  }
}

// Using Express Router Class
const router = express.Router();

// Temporary route to clear all users (for testing only)
router.delete('/clear-all', async (req: Request, res: Response) => {
  try {
    await User.deleteMany({});
    return res.status(200).json({ message: 'All users cleared successfully' });
  } catch (err) {
    console.error('Error clearing users:', err);
    return res.status(500).json({ message: 'Error clearing users' });
  }
});

// The below mentioned function is responsible for allowing users to log in.
router.post('/', async (req: ExtendedRequest, res: Response) => {
  try {
    const { email_id, password } = req.body;
    
    // Checking if both email id and password is entered
    if (!email_id || !password) {
      return res.status(400).json({ message: 'Please enter both email and password' });
    }

    // Checking if Email Id exists and if not request registering as a new account
    const userLogin = await User.findOne({ email_id });
    
    if (!userLogin) {
      return res.status(400).json({ message: 'Invalid Email ID. Please register before signing in' });
    }

    // Comparing the entered password with the one present in dB
    console.log('Comparing passwords...');
    console.log('Input password length:', password.length);
    console.log('DB password length:', userLogin.password.length);
    
    const isMatched = await bcrypt.compare(password, userLogin.password);
    console.log('Password match result:', isMatched);
    
    if (!isMatched) {
      return res.status(403).json({ message: 'Access Denied: Invalid Credentials' });
    }

    // Store user information in session
    if (req.session) {
      console.log('Setting session user ID to:', userLogin._id.toString());
      
      // Store just the userID in the session without type errors
      req.session.userID = userLogin._id.toString();
      
      // Save the session explicitly to ensure it's stored
      req.session.save((err) => {
        if (err) {
          console.error('Error saving session:', err);
        } else {
          console.log('Session saved successfully');
        }
      });
    } else {
      console.warn('Session object not available');
    }

    // Return success response with user data including ID
    return res.status(200).json({ 
      message: 'Login Successful',
      user: {
        _id: userLogin._id.toString(),
        name: userLogin.name,
        email_id: userLogin.email_id,
        college_name: userLogin.college_name
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
