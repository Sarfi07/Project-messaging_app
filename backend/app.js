import express from "express";
import http from "http"; // Importing Node's http module
import { Server as SocketIOServer } from "socket.io";
import indexRouter from "./routes/index.js";
import logger from "morgan";
import cookieParser from "cookie-parser";
import passport from "./config/passport.js";
import cors from "cors";
import { initializeRooms, setupWebSocketServer } from "./utils/webSocket.js";

const app = express();
const server = http.createServer(app); // Creating HTTP server
// const wss = new WebSocketServer({ server });

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(cors());
app.use(passport.initialize());

app.use("/", indexRouter);

// create error and forward it to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ err });
});

// const rooms = {};

// const initializeRooms = async () => {
//   const allRooms = await prisma.room.findMany({
//     include: { participants: true },
//   });
//   allRooms.forEach((room) => {
//     rooms[room.id] = [];
//   });
// };

// wss.on("connection", (ws, req) => {
//   const urlParams = new URLSearchParams(req.url.split("?")[1]);
//   const token = urlParams.get("token");

//   if (!token) {
//     ws.close(1008, "No authenticatoin token provided");
//     return;
//   }

//   // verify token
//   jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
//     if (err) {
//       console.log(err);
//       ws.close(1008, JSON.stringify(err));
//       return;
//     }

//     try {
//       const user = await prisma.user.findUnique({
//         where: {
//           id: decoded.id,
//         },
//       });
//       if (!user) {
//         ws.close(1008, "User not found");
//         return;
//       }

//       ws.user = user;

//       ws.on("message", async (message) => {
//         console.log("Received");
//         const parsedMessage = JSON.parse(message);
//         const { action, content, roomId, name, type, fileBase64 } =
//           parsedMessage;
//         // message > roomId, content;
//         // make a new message instance and connect it with user and room

//         if (action === "sendMessage") {
//           handleMessage(ws, content, roomId);
//         }

//         if (action === "joinRoom") {
//           joinRoom(ws, roomId);
//         }

//         if (action === "createRoom") {
//           console.log("creating room...");
//           createRoom(ws, name);
//         }

//         if (type === "image") {
//           // todo
//           handleImage(ws, fileBase64, roomId);
//         }
//       });

//       ws.on("close", () => {
//         for (const roomId in rooms) {
//           rooms[roomId] = rooms[roomId].filter((client) => client !== ws);

//           // If the room becomes empty, delete it
//           if (rooms[roomId].length === 0) {
//             delete rooms[roomId];
//           }
//         }

//         console.log("A user disconnected");
//       });
//     } catch (dbError) {
//       ws.close(1011, JSON.stringify(dbError));
//     }
//   });
// });

// const handleImage = async (ws, fileBase64, roomId) => {
//   if (!rooms[roomId]) {
//     console.log("Room does not exists");
//     return;
//   }

//   const newImage = await prisma.message.create({
//     data: {
//       content: fileBase64,
//       room: { connect: { id: roomId } },
//       sender: { connect: { id: ws.user.id } },
//       type: "image",
//     },
//   });

//   rooms[roomId].forEach((client) => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(JSON.stringify(newImage));
//     }
//   });
// };

// const handleMessage = async (ws, content, roomId) => {
//   if (!rooms[roomId]) {
//     console.error("Room does not exist");
//     return;
//   }

//   const newMessage = await prisma.message.create({
//     data: {
//       content: content,
//       room: { connect: { id: roomId } },
//       sender: { connect: { id: ws.user.id } },
//     },
//   });

//   const messageObj = await prisma.message.findUnique({
//     where: {
//       id: newMessage.id,
//     },
//     include: {
//       sender: {
//         select: {
//           name: true,
//         },
//       },
//     },
//   });

//   rooms[roomId].forEach((client) => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(JSON.stringify(messageObj));
//     }
//   });
// };

// const joinRoom = (ws, roomId) => {
//   if (!rooms[roomId]) {
//     rooms[roomId] = [];
//   }
//   rooms[roomId].push(ws);

//   ws.send(
//     JSON.stringify({
//       type: "ROOM_JOINED",
//       roomId,
//     })
//   );
// };

// const createRoom = async (ws, name) => {
//   try {
//     // Create a new room in the database
//     const newRoom = await prisma.room.create({
//       data: {
//         name,
//       },
//     });

//     await prisma.user.update({
//       where: {
//         id: ws.user.id,
//       },
//       data: {
//         rooms: {
//           connect: {
//             id: newRoom.id,
//           },
//         },
//       },
//     });
//     // Store the new room in the rooms object
//     rooms[newRoom.id] = [];

//     // Send the new room ID back to the client via WebSocket
//     ws.send(
//       JSON.stringify({
//         type: "ROOM_CREATED",
//         roomId: newRoom.id,
//         roomName: newRoom.name,
//       })
//     );
//   } catch (error) {
//     console.error("Error creating room:", error);
//     // Send an error message back to the client if something goes wrong
//     ws.send(
//       JSON.stringify({ type: "ERROR", message: "Failed to create room" })
//     );
//   }
// };

// Start server
initializeRooms().then(() => {
  setupWebSocketServer(server);
  server.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
});
