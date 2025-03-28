// delete_user.ts
// Importing required libraries
import express, { Request, Response } from 'express';
import User from '../models/userSchema';
import jwt_Authenticate, { JWTRequest } from '../middlewares/jwt_authenticate';

// Using Express Router Class
const router = express.Router();

// The below function will be used to delete data of an indiviual fron the database.
router.delete(
  '/',
  jwt_Authenticate,
  async (req: JWTRequest, res: Response) => {
    try {
      const _id = req.userID;
      
      if (!_id) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      
      const single_user = await User.findByIdAndDelete(_id);
      res.status(200).json({
        success: true,
        message: `Successfully removed ${single_user} from the database.`,
      });
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ 
          success: false,
          error: 'We are experiencing some server problems!!' 
        });
    }
  }
);

export default router;
