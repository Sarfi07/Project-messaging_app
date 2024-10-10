import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import ChatComponent from "./components/Chat";
import Login from "./components/Login";
import PrivateRoute from "./components/PrivateRoute";
import HomePage from "./components/HomePage";
import Signup from "./components/SignUp";
import ErrorPage from "./components/ErrorPage";
import { useEffect, useState } from "react";
import CreateRoomAndJoinRoom from "./components/CreateAndJoinRoom";
import EditProfile from "./components/EditProfile";

const App: React.FC = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const ws = new WebSocket(
      `ws://${import.meta.env.VITE_BACKEND_WS_URL}/?token=${token}`
    );

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

  if (!socket) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/room/createOrJoin"
          element={
            <PrivateRoute>
              <CreateRoomAndJoinRoom ws={socket} />
            </PrivateRoute>
          }
        />

        <Route
          path="/chat/:roomId"
          element={
            <PrivateRoute>
              <ChatComponent socket={socket} />
            </PrivateRoute>
          }
        />

        <Route
          path="/editProfile"
          element={
            <PrivateRoute>
              <EditProfile />
            </PrivateRoute>
          }
        />

        {/* fallback for unmatched paths */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
};

export default App;
