// Importing required libraries
import express, { Request, Response } from 'express';
import User, { IUser } from '../models/userSchema';
import mongoose from 'mongoose';
import { Session } from 'express-session';
import { JWTRequest } from '../middlewares/jwt_authenticate';

// Define an extended request interface that includes both JWT and session properties
interface WishlistRequest extends JWTRequest {
  session: Session & {
    userID?: string;
  };
}

// Define a lightweight interface for the list item
interface ListItem {
  _id?: mongoose.Types.ObjectId;
  item_name: string;
  item_price: number;
  item_age: number;
  item_condition: number;
  item_image: string;
  item_tag: string;
  item_description: string;
  item_status: string;
}

// Using Express Router Class
const router = express.Router();

// Add item to wishlist
router.post('/add', async (req: WishlistRequest, res: Response) => {
  try {
    const { user_id, item_id, seller_id } = req.body;
    
    console.log('Add to wishlist request:', { user_id, item_id, seller_id });
    
    // Check if all required fields are present
    if (!user_id || !item_id || !seller_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: user_id, item_id, and seller_id are required',
      });
    }
    
    // Get the user ID from the session if not provided directly
    const userId = user_id || req.session?.userID || req.userID;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }
    
    // Find the seller to get the item details
    const seller = await User.findById(seller_id);
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found',
      });
    }
    
    // Find the item in the seller's list
    const sellerListItems = seller.list as unknown as (ListItem & { _id: mongoose.Types.ObjectId })[];
    const itemToSave = sellerListItems.find(
      item => item._id.toString() === item_id
    );
    
    if (!itemToSave) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in seller\'s list',
      });
    }
    
    // Create a reference string for wishlist 
    // Format: sellerId:itemId
    const wishlistReference = `${seller_id}:${item_id}`;
    
    // Update the user's wishlist
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Check if item is already in wishlist
    if (user.wishlist.includes(wishlistReference)) {
      return res.status(200).json({
        success: true,
        message: 'Item already in wishlist',
      });
    }
    
    // Add to wishlist
    user.wishlist.push(wishlistReference);
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Item added to wishlist successfully',
    });
  } catch (err) {
    console.error('Error adding to wishlist:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding to wishlist',
    });
  }
});

// Remove item from wishlist
router.delete('/remove', async (req: WishlistRequest, res: Response) => {
  try {
    const { user_id, wishlist_reference } = req.body;
    
    console.log('Remove from wishlist request:', { user_id, wishlist_reference });
    
    // Check if all required fields are present
    if (!wishlist_reference) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: wishlist_reference is required',
      });
    }
    
    // Get the user ID from the session if not provided directly
    const userId = user_id || req.session?.userID || req.userID;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }
    
    // Update user's wishlist
    const result = await User.updateOne(
      { _id: userId },
      { $pull: { wishlist: wishlist_reference } }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in wishlist or could not be removed',
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Item removed from wishlist successfully',
    });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while removing from wishlist',
    });
  }
});

// Get user's wishlist with full item details
router.get('/', async (req: WishlistRequest, res: Response) => {
  try {
    // Get user ID from session or JWT
    const userId = req.session?.userID || req.userID;
    
    console.log('Get wishlist request, user ID:', userId);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }
    
    // Find the user and get their wishlist
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // If wishlist is empty, return empty array
    if (!user.wishlist || user.wishlist.length === 0) {
      return res.status(200).json({
        success: true,
        wishlist: [],
      });
    }
    
    // Process each wishlist reference to get full item details
    const wishlistItemsPromises = user.wishlist.map(async (reference) => {
      // Parse the reference string
      const [sellerId, itemId] = reference.split(':');
      
      // Find the seller
      const seller = await User.findById(sellerId);
      
      if (!seller) {
        return null; // Skip if seller not found
      }
      
      // Find the item in seller's list
      const sellerListItems = seller.list as unknown as (ListItem & { _id: mongoose.Types.ObjectId })[];
      const item = sellerListItems.find(
        item => item._id.toString() === itemId
      );
      
      if (!item) {
        return null; // Skip if item not found
      }
      
      // Return item with additional info
      // Convert item to a plain object
      const plainItem = {
        _id: item._id.toString(),
        item_name: item.item_name,
        item_price: item.item_price,
        item_age: item.item_age,
        item_condition: item.item_condition,
        item_image: item.item_image,
        item_tag: item.item_tag,
        item_description: item.item_description,
        item_status: item.item_status,
        sellerId,
        sellerName: seller.name || 'Unknown User',
        wishlistReference: reference,
      };
      
      return plainItem;
    });
    
    // Resolve all promises
    const wishlistItems = await Promise.all(wishlistItemsPromises);
    
    // Filter out null values (items that couldn't be found)
    const validWishlistItems = wishlistItems.filter(Boolean);
    
    return res.status(200).json({
      success: true,
      wishlist: validWishlistItems,
    });
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching wishlist',
    });
  }
});

export default router; 