import io from "socket.io-client";
import { useState, useEffect } from "react";
import Chat from "./Chat";
import Style from "./css/style.css";
import { SOCKET_URL } from "../../services/api";

// Ensure SOCKET_URL doesn't end with a slash
const normalizedSocketUrl = SOCKET_URL.endsWith('/') ? SOCKET_URL.slice(0, -1) : SOCKET_URL;

// Use the SOCKET_URL from our centralized service
console.log("Chat connecting to socket server:", normalizedSocketUrl);

// Initialize socket with proper options
const socket = io(normalizedSocketUrl, {
  path: '/socket.io', // Ensure path is set correctly
  transports: ['polling'],          // Use only polling since WebSockets might be failing on Vercel
  reconnectionAttempts: 5,          // Try to reconnect 5 times
  reconnectionDelay: 1000,          // Start with 1 second delay between attempts
  timeout: 20000,                   // Wait 20 seconds before timing out
  forceNew: true,                   // Force a new connection
  autoConnect: false,               // Don't connect automatically - we'll do it manually
  withCredentials: false            // Don't send credentials for socket.io
});

// Add socket event listeners
socket.on('connect', () => {
  console.log('Socket.io connected successfully with ID:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('Socket.io connection error:', error.message, 'URL:', normalizedSocketUrl);
  // Add more diagnostic information
  console.log('Browser location:', window.location.href);
  console.log('Network status:', navigator.onLine ? 'online' : 'offline');
  try {
    console.log('Socket transport:', socket.io.engine.transport.name);
    console.log('Socket opts:', JSON.stringify(socket.io.opts));
  } catch (e) {
    console.log('Could not access socket transport details:', e.message);
  }
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log(`Socket.io reconnection attempt #${attemptNumber}`);
});

socket.on('reconnect_failed', () => {
  console.error('Socket.io failed to reconnect after multiple attempts');
});

// Attempt connection manually after setting up all listeners
setTimeout(() => {
  console.log('Attempting to connect Socket.io...');
  socket.connect();
}, 1000);

function App(props) {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState(props.id);
  const [showChat, setShowChat] = useState(false);
  const [connectionFailed, setConnectionFailed] = useState(false);

  // Listen for connection errors and set state
  useEffect(() => {
    socket.on('connect_error', () => {
      setConnectionFailed(true);
    });

    return () => {
      socket.off('connect_error');
    };
  }, []);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      setShowChat(true);
    }
  };

  // Show fallback UI if connection fails
  if (connectionFailed) {
    return (
      <div className="App">
        <div className="joinChatContainer">
          <div className="text-slate-600 text-[150%] text-left ml-2">
            Chat Temporarily Unavailable
          </div>
          <p className="text-gray-500 text-sm mb-4">
            We're experiencing issues with our chat service. Please try again later.
          </p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {!showChat ? (
        <div className="joinChatContainer">
          <div className=" text-slate-600 text-[150%] text-left ml-2">
            Contact With Owner
          </div>
          <input
            type="text"
            placeholder="Type Your Alias Here...."
            onChange={(event) => {
              setUsername(event.target.value);
            }}
          />
          {/*<input
            type="text"
            placeholder="Room ID..."
            onChange={(event) => {
              setRoom(event.target.value);
            }}
          />*/}
          <button onClick={joinRoom}>Chat</button>
        </div>
      ) : (
        <Chat socket={socket} username={username} room={room} />
      )}
    </div>
  );
}

export default App;
