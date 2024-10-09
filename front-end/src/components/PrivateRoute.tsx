import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface ComponentProps {
  children: ReactNode;
}

const PrivateRoute = ({ children }: ComponentProps) => {
  const [validUser, setValidUser] = useState<boolean | null>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setValidUser(false); // No token, invalid user
        return;
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/verifyToken`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          }
        );

        const data = await res.json();
        setValidUser(data.success); // Set validUser based on backend response
      } catch (error) {
        console.error("Error verifying token:", error);
        setValidUser(false);
      }
    };

    verifyToken();
  }, [token]);

  // Render loading state while verifying the user
  if (validUser === null) {
    return <div>Loading...</div>;
  }

  // If not valid, redirect to login
  if (!validUser) {
    return <Navigate to="/login" />;
  }

  // If valid user, render children
  return <>{children}</>;
};

export default PrivateRoute;
