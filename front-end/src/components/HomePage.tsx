import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

interface Chat {
  id: string;
  name: string;
}

const HomePage = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/chat/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch chats");
      }

      const data = await response.json();
      setChats(data);
      console.log(data);
    };

    fetchChats();
  }, []);

  const handleCreateBtnClick = () => {
    navigate("/room/createOrJoin");
  };

  const handleEditProfileBtnclick = () => {
    navigate("/editProfile");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome to Your Homepage
        </h1>
        <button
          onClick={handleEditProfileBtnclick}
          className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600"
        >
          Edit Profile
        </button>
      </div>

      {/* Chat Rooms Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Your Chat Rooms
        </h2>
        {chats && chats.length > 0 ? (
          <ul className="space-y-2">
            {chats.map((room) => (
              <li key={room.id} className="flex justify-between items-center">
                {/* Link to chat room */}
                <Link
                  to={`/chat/${room.id}`}
                  className="text-blue-500 hover:underline"
                >
                  {room.name ? room.name : room.id}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">
            You haven't joined any chat rooms yet.
          </p>
        )}
      </div>

      {/* Room Actions Section */}
      <div className="flex space-x-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
          onClick={handleCreateBtnClick}
        >
          Create or Join a Room
        </button>
      </div>

      {/* Footer or Additional Info */}
      <footer className="mt-12 text-gray-600 text-center">
        <p>
          Enjoy your experience! Customize your profile, chat with others, and
          join rooms!
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
