// jwt_authenticate.ts
import jwt, { JwtPayload } from 'jsonwebtoken';
import User, { IUser } from '../models/userSchema';
import express, { Request, Response, NextFunction } from 'express';

// Define extended request interface with JWT properties
export interface JWTRequest extends Request {
  token?: string;
  rootUser?: IUser;
  userID?: string;
  user?: {
    _id: string;
    admin: boolean;
  };
}

// The jwt_Authenticate function is a middleware that authenticates requests using JSON Web Tokens (JWT)
const jwt_Authenticate = async (
  req: JWTRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Retrieve the JWT from the cookies sent with the request
    const token = req.cookies.jwtoken;
    console.log('JWT token received:', token ? 'Present' : 'Missing');

    // Check if process.env.JWT_KEY has a value
    if (!process.env.JWT_KEY) {
      console.error('No secret key provided in process.env.JWT_KEY');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Verify the JWT using the secret key
    const verifyToken = jwt.verify(token, process.env.JWT_KEY);
    console.log('Token verified successfully');

    // Check if verifyToken is an object and has the _id property
    if (typeof verifyToken === 'object' && '_id' in verifyToken) {
      // Narrow down the type of verifyToken to JwtPayload
      const payload = verifyToken as JwtPayload;

      // Find a user in the database with the same _id as in the verified JWT and with a matching token
      const rootUser = await User.findOne({
        _id: payload._id,
        'tokens.token': token,
      });

      // If no user is found, throw an error
      if (!rootUser) {
        console.error('User not found for token');
        return res.status(401).json({ message: 'User not found' });
      }

      // If a user is found, add the token, rootUser, and userID to the request object.
      req.token = token;
      req.rootUser = rootUser;
      req.userID = rootUser._id;
      
      // Add user property for more consistent access in route handlers
      req.user = {
        _id: rootUser._id.toString(),
        admin: rootUser.admin || false
      };
      
      console.log('User authenticated successfully:', rootUser.email_id);
      next();
    } else {
      // Handle the case where verifyToken is not a valid JwtPayload
      console.error('Invalid JWT payload');
      return res.status(401).json({ message: 'Invalid token format' });
    }
  } catch (err) {
    console.error('JWT authentication error:', err);
    // If there is an error, respond with a 401 status code and an error message
    res.status(401).json({ message: 'Unauthorized: Invalid or missing token' });
  }
};

export default jwt_Authenticate;
