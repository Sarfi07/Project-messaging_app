// utils/jwtUtils.js
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY;
const EXPIRATION_TIME = "24h";

// Function to generate a JWT token
export const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
    expiresIn: EXPIRATION_TIME,
  });
};

// Function to verify a JWT token
export const verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY);
};
