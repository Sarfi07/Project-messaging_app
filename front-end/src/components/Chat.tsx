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
  type: string;
}

const ChatComponent: React.FC<ChatProps> = ({ socket }) => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const { roomId } = useParams();
  const [userId, setUserId] = useState<string>("");
  const [fileInfo, setFileInfo] = useState<string>("");
  const [fileBase64, setFileBase64] = useState<string>("");
  const [isModalOpen, setIsModelOpen] = useState<boolean>(false);

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
      setUserId(data.userId);

      scrollToBottom();
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

  const sendImage = () => {
    if (socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({ roomId, fileBase64, type: "image" })
      );
    }

    setFileBase64("");
    setFileInfo("");
    setIsModelOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage(message);
    setMessage("");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;

    if (file) {
      setFileInfo(`Selected file: ${file.name}`);

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = function (e: ProgressEvent<FileReader>) {
          if (e.target && e.target.result) {
            setFileInfo(
              `<img src="${e.target.result}" className=mt-2 w-24 h-24 object-cover rounded-lg />`
            );
            const base64String = e.target.result as string;
            setFileBase64(base64String);
            setIsModelOpen(true);
          }
        };

        reader.readAsDataURL(file);
      } else {
        alert("Please select an image file.");
      }
    }

    event.target.value = "";
  };

  const closeModal = () => {
    setFileBase64("");
    setFileInfo("");
    setIsModelOpen(false);
  };

  const createImageEl = (src: string) => {
    return (
      <img
        src={src}
        alt="Message content"
        className="mt-2 w-128 h-128 object-cover rounded-lg"
      />
    );
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
            {messages.map((msg, index) => (
              <li
                key={msg.id || index}
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
                {msg.type === "image"
                  ? createImageEl(msg.content)
                  : msg.content}
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
            className="flex items-center gap-2 relative"
          >
            <div className="relative flex-grow">
              <label
                htmlFor="image"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 cursor-pointer ml-1"
              >
                📎
              </label>

              <input
                type="file"
                name="image"
                id="image"
                className="hidden"
                onChange={handleFileSelect}
              />

              <input
                autoFocus
                className="w-full pl-8 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-500 rounded-full hover:bg-blue-600"
            >
              Send
            </button>
          </form>

          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-lg p-6 w-1/2">
                <h2 className="text-lg font-semibold">File Selected</h2>
                <div
                  id="fileInfo"
                  className="mt-2 text-sm text-gray-500"
                  dangerouslySetInnerHTML={{ __html: fileInfo || "" }}
                ></div>
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={closeModal}
                    className=" px-4 py-2 text-white bg-blue-500 rounded-full hover:bg-blue-600"
                  >
                    Close
                  </button>
                  <button
                    onClick={sendImage}
                    className="px-4 py-2 text-white bg-blue-500 rounded-full hover:bg-blue-600"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatComponent;
