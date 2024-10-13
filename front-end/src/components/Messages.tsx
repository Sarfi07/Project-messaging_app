import { MessagesProps } from "./types";

const Messages: React.FC<MessagesProps> = ({
  messages,
  messagesEndRef,
  userId,
}) => {
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
            alignSelf: msg.sender_id === userId ? "flex-end" : "flex-start",
          }}
        >
          <span
            className="block text-xs font-semibold mb-1 text-gray-700 sm:text-black-500"
            style={{ marginTop: "-5px" }} // Optional: Add some spacing at the top
          >
            {msg.sender ? msg.sender.name : "Unknown Sender"}
          </span>
          {msg.type === "image" ? createImageEl(msg.content) : msg.content}
          {/* Timestamp */}
          <div
            className={`text-xs text-gray-500 mt-1 text-right ${
              msg.sender_id === userId
                ? "text-white self-start"
                : " text-black self-end"
            }`}
          >
            {new Date(msg.createdAt).toLocaleString()}{" "}
            {/* Format to display only time */}
          </div>
        </li>
      ))}
      <div className="" ref={messagesEndRef}></div>
    </ul>
  );
};

export default Messages;
