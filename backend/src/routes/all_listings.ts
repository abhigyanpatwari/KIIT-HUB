// Importing required libraries
import express from 'express';
import User from '../models/userSchema';

// Using Express Router Class
const router = express.Router();

// Debug route to check if this router is properly mounted
router.get('/test', (req: express.Request, res: express.Response) => {
  console.log('all_listings test route accessed');
  res.status(200).json({ message: 'all_listings route is working!' });
});

// Get the whole data from the database
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    console.log('GET /db endpoint accessed');
    // const user = await User.find({});
    const user = await User.find({}).select({ list: 1, name: 1 });

    console.log(`Found ${user.length} users with listings`);
    res.status(200).send(user);
  } catch (err) {
    // Consoling error for proper debugging.
    console.log('Error in /db endpoint:', err);
    res
      .status(500)
      .json({ error: 'We are experiencing some server problems!!' });
  }
});

export default router;
