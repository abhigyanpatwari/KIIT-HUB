// logout.ts
// Importing required libraries
import express, { Request, Response } from 'express';
import session_Authenticate from '../middlewares/session_authenticate';

// Extended request with session
interface ExtendedRequest extends Request {
  session: any;
  token?: string;
  rootUser?: any;
  userID?: string;
}

// Using Express Router Class
const router = express.Router();

// The below function will be used to logout a user
router.get(
  '/',
  async (req: ExtendedRequest, res: Response) => {
    try {
      console.log('Logout request received');
      
      // Destroy the session if it exists
      if (req.session) {
        req.session.destroy((err: Error) => {
          if (err) {
            console.error('Error destroying session:', err);
          }
        });
      }
      
      // Clear all cookies that might be used for authentication
      res.clearCookie('connect.sid');
      res.clearCookie('jwtoken');  // Clear JWT cookie if using cookies for JWT
      
      res.status(200).json({ success: true, message: 'Logout successful' });
      console.log('Logout successful');
    } catch (err) {
      console.error('Error during logout:', err);
      res
        .status(500)
        .json({ success: false, error: 'We are experiencing some server problems!!' });
    }
  }
);

export default router;
