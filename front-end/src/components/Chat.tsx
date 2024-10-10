import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import MessagesComp from "./Messages";
import { Message } from "./types";
import ChatForm from "./ChatForm";

interface ChatProps {
  socket: WebSocket;
  setSocket: React.Dispatch<React.SetStateAction<WebSocket | null>>;
}

const ChatComponent: React.FC<ChatProps> = ({ socket, setSocket }) => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const { roomId } = useParams();
  const [userId, setUserId] = useState<string>("");
  const [fileInfo, setFileInfo] = useState<string>("");
  const [fileBase64, setFileBase64] = useState<string>("");
  const [isModalOpen, setIsModelOpen] = useState<boolean>(false);

  const socketRef = useRef(socket);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://${import.meta.env.VITE_BACKEND_WS_URL}`);

    ws.onopen = () => {
      console.log("connection established");

      setSocket(ws);
    };

    ws.onerror = (e) => {
      console.error("Websocket error:", e);
    };

    ws.onclose = (event) => {
      console.log("connection closed", event);
    };

    return () => ws.close();
  }, []);

  // for display new message in view
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  });

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

  if (!socket) return <div>Loading...</div>;

  return (
    <>
      <div className="" id="gridContainer">
        {/* Chat messages section */}
        <div
          id="messsagesContainer"
          className="flex-1 p-4 overflow-y-auto bg-gray-100"
        >
          <MessagesComp
            messages={messages}
            userId={userId}
            messagesEndRef={messagesEndRef}
          />
        </div>

        {/* Message input section */}
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 p-2">
          <ChatForm
            handleSubmit={handleSubmit}
            handleFileSelect={handleFileSelect}
            message={message}
            setMessage={setMessage}
          />

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
