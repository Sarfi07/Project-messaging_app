import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

interface ChatProps {
  socket: WebSocket;
}
interface Message {
  id: string;
  content: string;
  sender_id: string;
  room_Id: string;
  createdAt: string;
}

const ChatComponent: React.FC<ChatProps> = ({ socket }) => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const { roomId } = useParams();
  const [userId, setUserId] = useState<string>("");

  const socketRef = useRef(socket);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // for display new message in view
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      const token = localStorage.getItem("token");

      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            action: "joinRoom",
            roomId,
          })
        );
      }
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/chat/${roomId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Room not found");
      }
      const data = await response.json();
      setMessages(data.messages);
      console.log(data);
      setUserId(data.userId);
    };

    socketRef.current.onmessage = (event: MessageEvent) => {
      const newMessage = JSON.parse(event.data);
      setMessages((prevMessages: Message[]) =>
        prevMessages.some((msg) => msg.id === newMessage.id)
          ? prevMessages
          : [...prevMessages, newMessage]
      );
      scrollToBottom();
    };

    fetchMessages();

    const currentSocket = socketRef.current;
    return () => {
      currentSocket.onmessage = null;
    };
  }, [socket, roomId]);

  const sendMessage = (message: string) => {
    if (socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({ action: "sendMessage", content: message, roomId })
      );
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage(message);
    setMessage("");
  };

  return (
    <>
      <div className="" id="gridContainer">
        {/* Chat messages section */}
        <div
          id="messsagesContainer"
          className="flex-1 p-4 overflow-y-auto bg-gray-100"
        >
          <ul className="space-y-2 flex flex-col gap-4">
            {messages.map((msg) => (
              <li
                key={msg.id}
                className={`p-2 rounded-lg shadow-md mr-4 ${
                  msg.sender_id === userId
                    ? "bg-blue-500 text-white self-end"
                    : "bg-white text-black self-start"
                } max-w-xs`}
                style={{
                  alignSelf:
                    msg.sender_id === userId ? "flex-end" : "flex-start",
                }}
              >
                {msg.content}
                {/* Timestamp */}
                <div
                  className={`text-xs text-gray-500 mt-1 text-right ${
                    msg.sender_id === userId
                      ? "text-white self-start"
                      : " text-black self-end"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString()}{" "}
                  {/* Format to display only time */}
                </div>
              </li>
            ))}
          </ul>

          <div className="" ref={messagesEndRef}></div>
        </div>

        {/* Message input section */}
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 p-2">
          <form
            id="inputForm"
            onSubmit={handleSubmit}
            className="flex items-center gap-2"
          >
            <input
              autoFocus
              className="flex-grow px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-500 rounded-full hover:bg-blue-600"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChatComponent;
