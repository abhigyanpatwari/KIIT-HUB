import dotenv from 'dotenv';
// Configure environment variables at the start
dotenv.config();

import http from 'http';
import { Server } from 'socket.io';
import connectDB from './src/db/conn';
import app from './app'; // Import the Express app from app.ts

// Check for required environment variables
if (!process.env.PORT) {
  console.warn("PORT environment variable not found, using default 5001");
}

if (!process.env.DB) {
  console.warn("DB environment variable not found, MongoDB connection will fail");
}

// Log important configuration
console.log("Server starting with configuration:");
console.log(`- Port: ${process.env.PORT || 5001}`);
console.log(`- Database: ${process.env.DB ? "Configured" : "Not configured"}`);
console.log(`- Environment: ${process.env.NODE_ENV || "development"}`);

// Add health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Port number from environment variable
const port = process.env.PORT || 5001;

// Initialize MongoDB connection and start server
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();
    
    // Create the server
    const server = http.createServer(app);

    // Configure Socket.io with simplified options
    const io = new Server(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? 'https://kiithub-frontend.vercel.app'
          : '*', // Allow all origins for development
        methods: ['GET', 'POST']
      },
      transports: ['polling']
    });

    // Simplified connection handler
    io.on("connection", (socket) => {
      console.log("New socket connection: ", socket.id);
      
      // Handle chat room joining
      socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
      });

      // Handle message sending
      socket.on('send_message', (data) => {
        console.log(`Message from ${socket.id} to room ${data.room}`);
        socket.to(data.room).emit('receive_message', data);
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
    
    // Add Socket.io health check route
    app.get('/socket-health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        socketio: 'initialized',
        timestamp: new Date().toISOString(),
        version: '1.0.5',
        buildTime: new Date().toISOString(),
        forceDeploy: true
      });
    });

    // Start listening only after MongoDB is connected
    server.listen(port, () => {
      console.log(`✅ Server is running on port ${port}`);
      console.log(`Try accessing these routes to test:
- http://localhost:${port}/health     (Health check)
- http://localhost:${port}/test       (API test)
- http://localhost:${port}/wishlist-test (Wishlist API test)`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer().catch(err => {
  console.error('Unhandled error during server startup:', err);
  process.exit(1);
});
