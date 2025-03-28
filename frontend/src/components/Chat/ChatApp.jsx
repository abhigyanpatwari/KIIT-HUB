import io from "socket.io-client";
import { useState, useEffect } from "react";
import Chat from "./Chat";
import Style from "./css/style.css";
import { SOCKET_URL } from "../../services/api";

// Use the SOCKET_URL from our centralized service
console.log("Chat connecting to socket server:", SOCKET_URL);

// Initialize socket with proper options
const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'], // Try WebSocket first, fall back to polling
  reconnectionAttempts: 5,              // Try to reconnect 5 times
  reconnectionDelay: 1000,              // Start with 1 second delay between attempts
  timeout: 20000,                       // Wait 20 seconds before timing out
  withCredentials: true                 // Include credentials for CORS
});

// Add socket event listeners
socket.on('connect', () => {
  console.log('Socket.io connected successfully with ID:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('Socket.io connection error:', error.message);
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log(`Socket.io reconnection attempt #${attemptNumber}`);
});

socket.on('reconnect_failed', () => {
  console.error('Socket.io failed to reconnect after multiple attempts');
});

function App(props) {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState(props.id);
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      setShowChat(true);
    }
  };

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
