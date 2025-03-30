import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import Style from "./css/style.css";

function Chat({ socket, username, room, messages, sendMessage: httpSendMessage }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  
  // Determine if we're using Socket.io or HTTP fallback
  const usingSocketIO = !!socket;
  
  useEffect(() => {
    // If external messages are provided (HTTP fallback mode), use them
    if (messages && messages.length > 0) {
      setMessageList(messages);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      if (usingSocketIO) {
        // Use Socket.io
        await socket.emit("send_message", messageData);
        setMessageList((list) => [...list, messageData]);
      } else {
        // Use HTTP fallback
        const success = await httpSendMessage(messageData);
        if (success) {
          console.log('Message sent via HTTP');
        }
      }
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    if (usingSocketIO) {
      socket.on("receive_message", (data) => {
        setMessageList((list) => [...list, data]);
      });
      
      // Cleanup listener on unmount
      return () => {
        socket.off("receive_message");
      };
    }
  }, [socket, usingSocketIO]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat {!usingSocketIO ? '(Fallback Mode)' : ''}</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent, index) => {
            return (
              <div
                key={index}
                className="message"
                id={username === messageContent.author ? "you" : "other"}
              >
                <div>
                  <div className="message-content">
                    <p>{messageContent.message}</p>
                  </div>
                  <div className="message-meta">
                    <p id="time">{messageContent.time}</p>
                    <p id="author">{messageContent.author}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

export default Chat;
