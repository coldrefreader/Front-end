import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "../styles/Chatbox.css";

const socket = io("http://localhost:5080");

export default function Chatbox({ username }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!username) {
      console.log("Username missing, chat may not function properly.");
    }

    // ✅ Add a single event listener for incoming messages
    const handleReceiveMessage = (newMessage) => {
      console.log("Received message:", newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage); // ✅ Cleanup properly
    };
  }, []); // ✅ Run only ONCE

  const sendMessage = () => {
    if (!message.trim()) return;

    if (!username) {
      console.log("Username is missing, not sending.");
      return;
    }

    const messageData = { sender: username, message };
    console.log("Sending message:", messageData);

    socket.emit("sendMessage", messageData);

    // ✅ Add the message to state so the sender sees it too
    setMessages((prevMessages) => [...prevMessages, { sender: "You", message }]);

    setMessage("");
  };

  return (
    <div className="chatbox-container">
      <div className="chatbox-messages">
        {messages.map((msg, index) => (
          <p key={index} className={msg.sender === "You" ? "chatbox-you" : "chatbox-other"}>
            <strong>{msg.sender}:</strong> {msg.message}
          </p>
        ))}
      </div>
      <input
        type="text"
        value={message}
        placeholder="Type a message..."
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
