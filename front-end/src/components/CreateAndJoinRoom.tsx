import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Ws {
  ws: WebSocket;
}

const CreateRoomAndJoinRoom: React.FC<Ws> = ({ ws }) => {
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [message, setMessage] = useState("");
  const [roomLink, setRoomLink] = useState("");
  const navigate = useNavigate();

  // Create Room
  const handleCreateRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (roomName.trim()) {
      // Send the room name to the server via WebSocket to create a new room
      ws.send(JSON.stringify({ action: "createRoom", name: roomName }));
    }
  };

  // Join Room
  const handleJoinRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (roomId.trim()) {
      // Send the room ID to the server via WebSocket to join the room
      ws.send(JSON.stringify({ action: "joinRoom", roomId }));
    }
  };

  // WebSocket message handling
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "ROOM_CREATED") {
      setMessage(`Room created successfully! Room ID: ${data.roomId}`);
      setRoomLink(data.roomId);
      setRoomName("");
    } else if (data.type === "ROOM_JOINED") {
      setMessage(`Joined room successfully! Room ID: ${data.roomId}`);
      setRoomLink(data.roomId);
      setRoomId("");
    } else if (data.type === "ERROR") {
      setMessage(`Error: ${data.message}`);
    }
  };

  const handleOpenRoom = () => {
    navigate(`/chat/${roomLink}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Create or Join a Room</h1>

      {/* Form to Create a Room */}
      <form
        onSubmit={handleCreateRoom}
        className="bg-white p-4 rounded-lg shadow-md mb-4 w-80"
      >
        <h2 className="text-xl font-semibold mb-2">Create a Room</h2>
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Enter Room Name"
          className="border border-gray-300 p-2 w-full mb-4 rounded-lg"
        />
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Create Room
        </button>
      </form>

      {/* Form to Join a Room */}
      <form
        onSubmit={handleJoinRoom}
        className="bg-white p-4 rounded-lg shadow-md w-80"
      >
        <h2 className="text-xl font-semibold mb-2">Join a Room</h2>
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter Room ID"
          className="border border-gray-300 p-2 w-full mb-4 rounded-lg"
        />
        <button
          type="submit"
          className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Join Room
        </button>
      </form>

      {/* Display Message */}
      {message && <p className="mt-6 text-gray-800 font-semibold">{message}</p>}

      {roomLink && (
        <button
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          onClick={handleOpenRoom}
        >
          Open Room
        </button>
      )}
    </div>
  );
};

export default CreateRoomAndJoinRoom;
