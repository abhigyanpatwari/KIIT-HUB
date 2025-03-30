// Importing required libraries
import express from 'express';

// Using Express Router Class
const router = express.Router();

// Get the whole data from the database
router.get('/', (req: express.Request, res: express.Response) => {
  res.status(200).send('The API base endpint is working correctly');
});

// Add a CORS debug endpoint
router.all('/cors-test', (req, res) => {
  res.status(200).json({
    message: 'CORS test successful',
    method: req.method,
    headers: req.headers,
    origin: req.get('origin')
  });
});

export default router;
