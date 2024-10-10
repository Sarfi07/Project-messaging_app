import { ChatFormProps } from "./types";

const ChatForm: React.FC<ChatFormProps> = ({
  handleSubmit,
  handleFileSelect,
  message,
  setMessage,
}) => {
  return (
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
  );
};

export default ChatForm;
