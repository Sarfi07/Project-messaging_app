import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import ChatComponent from "./components/Chat";
import Login from "./components/Login";
import PrivateRoute from "./components/PrivateRoute";
import HomePage from "./components/HomePage";
import Signup from "./components/SignUp";
import ErrorPage from "./components/ErrorPage";
import { useState } from "react";
import CreateRoomAndJoinRoom from "./components/CreateAndJoinRoom";
import EditProfile from "./components/EditProfile";

const App: React.FC = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

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
          path="/editProfile"
          element={
            <PrivateRoute>
              <EditProfile />
            </PrivateRoute>
          }
        />

        {socket && (
          <>
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
                  <ChatComponent socket={socket} setSocket={setSocket} />
                </PrivateRoute>
              }
            />
          </>
        )}
        {/* fallback for unmatched paths */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
};

export default App;
