// config/passport.js
import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import prisma from "../utils/prismaClient.js";
import "dotenv/config";
import bcrypt from "bcrypt";

// Local strategy for username and password authentication
passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    async (username, password, done) => {
      console.log("trying to authenticate user:", username);
      try {
        // Find the user by username
        const user = await prisma.user.findFirst({
          where: { username },
        });

        // If user is not found
        if (!user) {
          return done(null, false, { message: "Invalid credentials or role" });
        }

        // Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Invalid credentials" });
        }

        // Return the user if authentication succeeds
        return done(null, user);
      } catch (err) {
        console.error("Error during local authentication:", err);
        return done(err); // Pass the error to the done callback
      }
    }
  )
);

// JWT strategy options
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY,
};

// JWT strategy for authenticating using JWT
passport.use(
  new Strategy(opts, async (jwt_payload, done) => {
    try {
      // Find user by ID from JWT payload
      const user = await prisma.user.findUnique({
        where: { id: jwt_payload.id },
      });

      if (user) {
        return done(null, user);
      } else {
        return done(null, false); // User not found
      }
    } catch (err) {
      console.error("Error during JWT authentication:", err);
      return done(err, false); // Pass the error to the done callback
    }
  })
);

// Serialize user ID to store in session
passport.serializeUser((user, done) => {
  if (!user) {
    return done(new Error("User not found")); // Handle case where user isn't found
  }
  done(null, user.id); // Call done with user ID
});

// Deserialize user from session using user ID
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return done(new Error("User not found")); // Handle case where user isn't found
    }
    done(null, user); // Call done with the user object
  } catch (err) {
    console.error("Error during user deserialization:", err);
    done(err); // Call done with the error
  }
});

export default passport;
