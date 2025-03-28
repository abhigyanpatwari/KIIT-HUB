// Importing required libraries
import express, { Request, Response } from 'express';
import User from '../models/userSchema';
import mongoose from 'mongoose';
import { Session } from 'express-session';

// Define extended request interface
interface ExtendedRequest extends Request {
  userID?: string;
  session: Session & {
    userID?: string;
  };
}

// Using Express Router Class
const router = express.Router();

// Test route that doesn't require authentication
router.get('/test', (req: Request, res: Response) => {
  console.log('Test route reached');
  res.status(200).json({ message: 'Add item route is working!' });
});

// Main add item handler - support both POST and PATCH
const addItemHandler = async (req: ExtendedRequest, res: Response) => {
  try {
    const {
      item_name,
      item_price,
      item_age,
      item_condition,
      item_image,
      item_tag,
      item_description,
    } = req.body;

    // Log the request for debugging
    console.log('Received add item request:', req.body);
    console.log('User ID from session:', req.session ? req.session.userID || 'Not in session' : 'No session');
    console.log('User ID from request:', req.userID || 'Not in request');

    // Check if all required fields are present
    if (
      !item_name ||
      !item_price ||
      !item_age ||
      !item_condition ||
      !item_image ||
      !item_tag ||
      !item_description
    ) {
      return res.status(400).json({
        error: 'Bad Request: Please enter all the required data.',
      });
    }

    // Check if item_tag is a valid value
    const validItemTags = [
      'Others',
      'Clothing_essentials',
      'Books',
      'Daily-use',
      'Sports',
      'Stationary',
    ];
    if (!validItemTags.includes(item_tag)) {
      return res.status(400).json({
        error: 'Bad Request: Invalid item tag.',
      });
    }

    const newItem = {
      item_name,
      item_price,
      item_age,
      item_condition,
      item_image,
      item_tag,
      item_description,
    };

    // Extract user ID from cookie for testing
    const cookies = req.headers.cookie?.split(';');
    let jwtCookie = cookies?.find(cookie => cookie.trim().startsWith('jwtoken='));
    let jwtToken = jwtCookie ? jwtCookie.split('=')[1] : null;
    console.log('JWT token from cookies:', jwtToken ? 'Found' : 'Not found');

    // Get the user ID from the session or directly from cookies via JWT
    const sessionUserId = req.session ? req.session.userID : null;
    const userId = sessionUserId || req.userID || req.body.user_id;
    
    if (!userId) {
      console.log('No user ID found, using demo ID for testing');
      // If no user ID is found, return success for testing but don't store anything
      return res.status(201).json({ 
        message: 'Item received (not stored - no user ID found)',
        data: newItem
      });
    }

    console.log('Using user ID:', userId);
    
    // Find the user first to confirm they exist
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found with ID:', userId);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User found:', user.email_id || user._id);

    // Update the user's list with the new item
    const result = await User.findByIdAndUpdate(
      userId,
      {
        $push: {  // Using $push instead of $addToSet to allow duplicates
          list: newItem,
        },
      },
      { new: true }  // Return the updated document
    );

    console.log('Update result:', result ? 'Success' : 'Failed');
    
    if (!result) {
      return res.status(500).json({ error: 'Failed to update user with new item' });
    }

    console.log('Item added to user profile, new list length:', result.list?.length || 0);

    // Get the complete user document after the update
    const updatedUser = await User.findById(userId);
    
    // Return the user document in the expected format
    res.status(201).json({ 
      message: 'Listing successfully added on the website',
      user: updatedUser
    });
  } catch (err) {
    console.error('Error in add_item:', err);
    res
      .status(500)
      .json({ error: 'We are experiencing some server problems!!' });
  }
};

// Support multiple HTTP methods for flexibility
router.post('/', addItemHandler);
router.patch('/', addItemHandler);
router.put('/', addItemHandler);

// Simple add item handler that doesn't require authentication for testing
router.post('/simple', async (req, res) => {
  try {
    console.log('Simple add item route reached with body:', req.body);
    
    const {
      item_name,
      item_price,
      item_age,
      item_condition,
      item_image,
      item_tag,
      item_description,
      user_id  // Allow passing user_id directly for testing
    } = req.body;
    
    // Check if all required fields are present
    if (
      !item_name ||
      !item_price ||
      !item_age ||
      !item_condition ||
      !item_image ||
      !item_tag ||
      !item_description
    ) {
      return res.status(400).json({
        error: 'Bad Request: Please enter all the required data.',
      });
    }
    
    // If user_id is provided, try to store the item
    if (user_id) {
      try {
        const newItem = {
          item_name,
          item_price,
          item_age,
          item_condition,
          item_image,
          item_tag,
          item_description,
        };
        
        // Update the user's list with the new item
        const result = await User.findByIdAndUpdate(
          user_id,
          {
            $push: {  // Using $push instead of $addToSet to allow duplicates
              list: newItem,
            },
          },
          { new: true }  // Return the updated document
        );
        
        if (result) {
          // Get the complete user document
          const updatedUser = await User.findById(user_id);
          
          return res.status(201).json({ 
            message: 'Item stored successfully via simple endpoint',
            user: updatedUser
          });
        }
      } catch (storeErr) {
        console.error('Error storing item with provided user_id:', storeErr);
      }
    }
    
    // Just return success for testing
    return res.status(200).json({ message: 'Item data received successfully' });
  } catch (err) {
    console.error('Error in simple route:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to remove an item
router.delete('/remove', async (req, res) => {
  try {
    const { item_id, user_id } = req.body;
    
    console.log('Remove item request:', { item_id, user_id });
    
    if (!item_id || !user_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Item ID and user ID are required' 
      });
    }
    
    // Find the user
    const user = await User.findById(user_id);
    
    if (!user) {
      console.log(`User not found for ID: ${user_id}`);
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Instead of checking if the item exists, directly attempt to remove it
    const result = await User.updateOne(
      { _id: user_id },
      { $pull: { list: { _id: new mongoose.Types.ObjectId(item_id) } } }
    );
    
    console.log('Update operation result:', result);
    
    if (result.modifiedCount === 0) {
      console.log(`Item ${item_id} not found or not removed from user ${user_id}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found or could not be removed' 
      });
    }
    
    console.log(`Item ${item_id} removed successfully from user ${user_id}`);
    
    return res.status(200).json({
      success: true,
      message: 'Item removed successfully'
    });
  } catch (err) {
    console.error('Error removing item:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while removing item'
    });
  }
});

export default router;

