import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // Get the navigate function

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("token", result.token); // Save JWT token
        setMessage("Login successful!");
        navigate("/"); // Redirect to content page
      } else {
        setMessage("Login failed: " + result.message);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage("An error occurred: " + error.message);
      } else {
        setMessage("An unknown error is occurred.");
      }
    }
  };

  const handleSingupRedirect = () => {
    navigate("/signup");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-gray-700 font-semibold mb-1"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded-md border-gray-300 focus:border-blue-500 focus:outline-none"
              autoFocus
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-gray-700 font-semibold mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-md border-gray-300 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <input type="hidden" name="role" value="READER" />
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
          >
            Login
          </button>
          {message && (
            <p
              className={`mt-4 text-center ${
                message.startsWith("Login successful")
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
        </form>

        <button
          onClick={handleSingupRedirect}
          className="text-blue-500 hover:text-blue-700 font-semibold underline"
        >
          Sign up instead.
        </button>
      </div>
    </div>
  );
}

export default Login;
