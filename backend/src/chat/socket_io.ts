// Importing required libraries
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Request, Response } from 'express';

// Creating an express app
const app = express();

// Using middleware for parsing and cors
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001',
    'http://localhost:3003',
    'https://kiithub-frontend.vercel.app',
    'https://kiithub.vercel.app',
    'https://kiit-hub.vercel.app',
    'https://kiit-hub-w7f4.vercel.app'
  ],
  credentials: true
}));

// Creating an http server
const server = http.createServer(app);

// Initialising Socket.io
const io = new Server(server, {
  cors: {
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
      'http://127.0.0.1:5173',
      'http://192.168.1.2:3000',
      'https://kiithub-frontend.vercel.app',
      'https://kiithub.vercel.app',
      'https://kiit-hub.vercel.app',
      'https://kiit-hub-w7f4.vercel.app'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true
  }
});

// Using Socket.io for chat purposes
io.on('connection', (socket) => {
  // Joining a room
  socket.on('join_room', (data) => {
    socket.join(data);
  });

  // Sending a message to a room
  socket.on('send_message', (data) => {
    socket.to(data.room).emit('receive_message', data);
  });

  // Disconnecting from a room
  socket.on('disconnect', () => {});
});

// Export the server to be used in index.ts
export default server;
