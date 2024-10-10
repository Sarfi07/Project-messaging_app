# Real-Time Messaging App

This project is a real-time chat application where users can sign up, authenticate, create or join chat rooms, and engage in conversations. It is built with modern technologies like WebSockets for real-time communication and Prisma for database management.

## Features

- **User Authentication**: Users can sign up, log in, and securely access the application with JWT-based authentication.
- **Chat Rooms**: Users can create or join chat rooms to communicate with others in real time.
- **Profile Management**: After signing up, users can edit their profiles and update their details.
- **Real-Time Messaging**: Users can send and receive messages in real time within chat rooms.
- **File Sharing (Coming Soon)**: Currently, users can send text messages, but file downloading functionality has not been implemented yet.

## Technologies Used

- **Frontend**: React (with Vite), TypeScript
- **Backend**: Express.js, Node.js, Prisma, WebSocket (ws library)
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: JSON Web Tokens (JWT), Passport.js
- **Hosting**: Xata for the database, other backend hosting via Render
- **Real-Time Communication**: WebSocket (ws library)
