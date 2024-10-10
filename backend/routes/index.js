// routes/authRoutes.js
import express from "express";
import passport from "../config/passport.js";
import { generateToken, verifyToken } from "../utils/jwtUtils.js";
import prisma from "../utils/prismaClient.js";
import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Welcome to the backend" });
});

// Login route for generating JWT token
router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message || "Unauthorized" });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({ token });
  })(req, res, next);
});

router.post("/signup", async (req, res, next) => {
  const { username, name, password } = req.body;
  try {
    const hassedPassword = await bcrypt.hash(password, 10);

    const userExists = await prisma.user.findMany({
      where: {
        username,
      },
    });

    if (!userExists.length) {
      const user = await prisma.user.create({
        data: {
          username,
          name,
          password: hassedPassword,
        },
      });

      if (user) {
        await prisma.room.create({
          data: {
            participants: {
              connect: [{ id: user.id }],
            },
          },
        });
      }

      const userInstance = await prisma.user.findFirst({
        where: {
          id: user.id,
        },
        include: {
          rooms: true,
        },
      });

      // Send a successful response back
      return res.status(200).json({ message: "User signed up successfully" });
    } else {
      return res
        .status(403)
        .json({ message: "Username already exists, try a different one." });
    }
  } catch (err) {
    // Catch any errors and send an error response
    return res.status(500).send(err);
  }
});

router.post(
  "/editProfile",
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res) => {
    try {
      // todo
      const { name, password } = req.body;
      const hassedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.update({
        where: {
          id: req.user.id,
        },
        data: {
          name,
          password: hassedPassword,
        },
      });

      res.json({ message: "Updated Profile Successfully!", success: true });
    } catch (err) {
      res.status(404).json({ message: "Failed to update profile", err });
    }
  })
);

router.get(
  "/chat/",
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: req.user.id,
        },
        include: {
          rooms: true,
        },
      });

      if (!user) {
        res.sendStatus(400);
      }

      res.json(user.rooms);
    } catch (err) {
      res.status(404).json(err);
    }
  })
);

router.get(
  "/chat/:roomId",
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    try {
      const room = await prisma.room.findFirst({
        where: {
          id: roomId,
        },
        include: {
          messages: {
            include: {
              sender: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
      if (room) {
        return res.json({ messages: room.messages, userId: req.user.id });
      } else {
        res.status(411).json({ message: "Room Id invalid" });
      }
    } catch (err) {
      return res.status(404).json(err);
    }
  })
);

router.post(
  "/verifyToken",
  asyncHandler(async (req, res) => {
    const { token } = req.body;

    try {
      const decoded = verifyToken(token);
      if (decoded) {
        return res.json({ success: true });
      }
    } catch (err) {
      return res.json({ success: false, err });
    }
  })
);

export default router;
