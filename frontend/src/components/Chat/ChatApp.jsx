import io from "socket.io-client";
import { useState, useEffect } from "react";
import Chat from "./Chat";
import Style from "./css/style.css";
import { SOCKET_URL, API_URL, apiCall } from "../../services/api";

// Ensure SOCKET_URL doesn't end with a slash
const normalizedSocketUrl = SOCKET_URL.endsWith('/') ? SOCKET_URL.slice(0, -1) : SOCKET_URL;
const normalizedApiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

// Use the SOCKET_URL from our centralized service
console.log("Chat connecting to socket server:", normalizedSocketUrl);
console.log("API URL for fallback:", normalizedApiUrl);

// Flag to determine whether to use Socket.io or API fallback
const useSocketIO = false; // Set to false to use HTTP fallback

// Initialize socket with very basic options for Vercel
const socket = useSocketIO ? io(normalizedSocketUrl, {
  transports: ['polling'],
  timeout: 10000,
  reconnectionAttempts: 3
}) : null;

// Add socket event listeners if using Socket.io
if (useSocketIO && socket) {
  socket.on('connect', () => {
    console.log('Socket.io connected successfully with ID:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.io connection error:', error.message, 'URL:', normalizedSocketUrl);
    // Add more diagnostic information
    console.log('Browser location:', window.location.href);
    console.log('Network status:', navigator.onLine ? 'online' : 'offline');
  });

  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log(`Socket.io reconnection attempt #${attemptNumber}`);
  });

  socket.on('reconnect_failed', () => {
    console.error('Socket.io failed to reconnect after multiple attempts');
  });
}

function App(props) {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState(props.id);
  const [showChat, setShowChat] = useState(false);
  const [connectionFailed, setConnectionFailed] = useState(false);
  const [messages, setMessages] = useState([]);
  
  // Check API health
  useEffect(() => {
    // Check if the API is reachable
    fetch(`${normalizedApiUrl}/api-health`)
      .then(res => res.json())
      .then(data => {
        console.log('API health check:', data);
      })
      .catch(err => {
        console.error('API health check failed:', err);
        setConnectionFailed(true);
      });
  }, []);

  // Listen for connection errors and set state if using Socket.io
  useEffect(() => {
    if (useSocketIO && socket) {
      socket.on('connect_error', () => {
        setConnectionFailed(true);
      });

      return () => {
        socket.off('connect_error');
      };
    }
  }, []);
  
  // Function to send message via HTTP instead of Socket.io
  const sendMessageViaHttp = async (messageData) => {
    try {
      const response = await fetch(`${normalizedApiUrl}/api/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: messageData.room,
          message: messageData.message,
          sender: messageData.author,
          time: messageData.time
        })
      });
      
      if (response.ok) {
        // Add the message to the local state
        setMessages(prev => [...prev, messageData]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error sending message via HTTP:', error);
      return false;
    }
  };
  
  // Function to poll for messages
  const pollForMessages = async (roomId) => {
    try {
      const response = await fetch(`${normalizedApiUrl}/api/messages/${roomId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        }
      }
    } catch (error) {
      console.error('Error polling for messages:', error);
    }
  };

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      if (useSocketIO && socket) {
        socket.emit("join_room", room);
      } else {
        // Start polling for messages
        const intervalId = setInterval(() => pollForMessages(room), 3000);
        // Store interval ID to clear it when unmounting
        console.log('Started polling for messages in room', room);
      }
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
        <Chat 
          socket={socket} 
          username={username} 
          room={room} 
          messages={messages}
          sendMessage={useSocketIO ? null : sendMessageViaHttp}
        />
      )}
    </div>
  );
}

export default App;
