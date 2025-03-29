// Importing required libraries
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';

// Initiating Connection to the MongoDB
import './src/db/conn';

// Initialsing and using Socket.io for chat functionality
import './src/chat/socket_io';

// Importing all routes
import all_listings from './src/routes/all_listings';
import register from './src/routes/register';
import add_item from './src/routes/add_item';
import profile from './src/routes/profile';
import delete_user from './src/routes/delete_user';
import signin from './src/routes/signin';
import logout from './src/routes/logout';
import base_endpoint from './src/routes/base_endpoint';
import otpRouter from './src/routes/otp';
import wishlist from './src/routes/wishlist';
import current_user from './src/routes/current_user';
import purchaseRouter from './src/routes/purchase';
import contactRouter from './src/routes/contact';

const app = express();

// Configure CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
    'http://localhost:3006',
    'http://localhost:8000',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',  // Vite default
    'http://192.168.1.2:3000',  // Add your local IP if needed
    'https://kiithub-frontend.vercel.app',
    'https://kiithub.vercel.app',
    'https://kiit-hub.vercel.app',
    'https://kiit-hub-w7f4.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());
app.use(cookieParser());

// Configure session
app.use(session({
  secret: 'kiithub_secret_key', 
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  },
  store: MongoStore.create({
    mongoUrl: process.env.DB || process.env.DATABASE, // Use the same connection string as the main MongoDB connection
    collectionName: 'sessions',
    touchAfter: 24 * 3600 // Only update sessions once per day
  })
}));

// Debug route to test server connectivity
app.get('/test', (req, res) => {
  res.status(200).json({ message: 'Server is working!' });
});

// Debug route for wishlist testing
app.get('/wishlist-test', (req, res) => {
  res.status(200).json({ 
    message: 'Wishlist endpoint is accessible!',
    endpoints: {
      add: '/wishlist/add',
      remove: '/wishlist/remove',
      list: '/wishlist'
    }
  });
});

// Setting Routes
console.log('Mounting all_listings route at /db');
app.use('/db', all_listings);

console.log('Mounting add_item route at /add_data');
app.use('/add_data', add_item);

console.log('Mounting register route at /register');
app.use('/register', register);

console.log('Mounting profile route at /profilec');
app.use('/profilec', profile);

console.log('Mounting delete_user route at /delete');
app.use('/delete', delete_user);

console.log('Mounting signin route at /signin');
app.use('/signin', signin);

console.log('Mounting logout route at /logout');
app.use('/logout', logout);

console.log('Mounting base_endpoint route at /');
app.use('/', base_endpoint);

console.log('Mounting otpRouter route at /');
app.use('/', otpRouter);

console.log('Mounting wishlist route at /wishlist');
app.use('/wishlist', wishlist);

console.log('Mounting current_user route at /current-user');
app.use('/current-user', current_user);

console.log('Mounting purchase route for email notifications');
app.use('/', purchaseRouter);

console.log('Mounting contact form route at /contact');
app.use('/contact', contactRouter);

// 404 handler for debugging
app.use((req, res, next) => {
  console.log(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

export default app;
