//imports
const express = require('express');
const chats = require('./Data/data');
const dotenv = require('dotenv');
const connectDB = require('./Config/database');
const colors = require('colors');
const userRoutes = require("./Routes/userRoutes");
const chatRoutes = require("./Routes/chatRoutes");
const notificationRoutes = require("./Routes/notificationRoutes");
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const messageRoutes = require('./Routes/messageRoutes');
const Notification = require('./models/notificationModel');
const path = require('path');
const cors = require("cors");


//assignments
const app = express();
const port = process.env.PORT || 5000;

//start DB and enable .evn file
dotenv.config();
console.log('Loaded CLIENT_URL:', process.env.CLIENT_URL);
connectDB();

//to accept JSON DATA
app.use(express.json());
const allowedOrigins = ['https://chit-chat-jade.vercel.app'];


//CORS FOR REST APIs
app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin like mobile apps or curl
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true // if you send cookies or auth headers
}));

//routes
app.use('/api/user', userRoutes);
app.use('/api/message', messageRoutes)
app.use("/api/chat", chatRoutes);
app.use("/api/notification", notificationRoutes);

// --------------------------DEPLOYMENT---------------------------

const __dirname1 = path.resolve();

// --------------------------DEPLOYMENT---------------------------

app.get("/", (req, res) => {
    res.send("API is running..");
});

//error Handling
app.use(notFound);
app.use(errorHandler);


//start app
const server = app.listen(port, () => {
    console.log(`Server started on ${port}`.yellow.bold);
})


//CORS FOR SOCKET.IO
const io = require('socket.io')(server, {
    // This configuration ensures that the server pings the client every 25 seconds
    // It waits up to 2 mins for a response before considering the client disconnected.
    pingTimeout: 120000, // 120 seconds timeout
    pingInterval: 25000, // 25 seconds interval
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true

    }
});

//Every time a client connects, this function runs with the new socket object.
//socket represents that specific connected client.
//This is the entry point. Every connected browser tab or app creates a new socket instance.
//The socket represents that user session.
//Two types of room- USER ROOM and CHAT ROOM
io.on("connection", (socket) => {
    console.log('connected to socket.io');

    //userData will hold the authenticated user info once they emit a "setup" event.
    let userData;

    //establish individual user connection to server
    //Identify the user and put them in a unique room (like their inbox).
    //Every user has a unique MongoDB _id, so we use that to create a private room just for them.
    //This allows us to send them messages or notifications individually, like a DM inbox.
    socket.on("setup", (user) => {
        userData = user;
        // Get the list of sockets in the room
        const roomSockets = io.sockets.adapter.rooms.get(userData._id);

        // Check if the user's socket ID is in the room's socket list
        if (roomSockets && roomSockets.has(socket.id)) {
            // User is already in the room
            console.log("User is already in the room");
        } else {
            // User is not in the room, so add them
            socket.join(userData._id);
            console.log("User joined the room");
        }
        socket.emit("connected");
    });

    //establish user connection to a chat room
    //join a specific chat room
    socket.on("join chat", (room) => {
        const roomSockets = io.sockets.adapter.rooms.get(room);
        if (roomSockets && roomSockets.has(socket.id)) {
            console.log('User already in room')
        }
        else {
            socket.join(room);
            console.log("User Joined Room: " + room);
        }

    });

    //real time send and recieve messages
    socket.on("new message", async (newMessage) => {
        let chat = newMessage.chat;
        let chatId = newMessage.chat._id;
        if (!chat.users)
            return console.log("chat.users not defined");

        chat.users.forEach(async (user) => {
            // Send message in real time to all users except the sender
            if (user._id == newMessage.sender._id)
                return;

            socket.in(user._id).emit("message recieved", newMessage);

            // Check if there's an unread notification for the same chat and user
            const existingNotification = await Notification.findOne({
                userId: user._id,
                chat: chatId,
                read: false
            });

            // Check if there's no unread notification for the same chat and user, create one
            if (!existingNotification) {
                let notification = await Notification.create({
                    userId: user._id,
                    chat: chatId,
                    read: false,
                    message: `New Message from ${newMessage.sender.name} `
                });
                notification = await notification.populate({
                    path: 'chat',
                    populate: {
                        path: 'users',
                        select: 'name'
                    }
                });

                // Emit a new notification event to the frontend
                socket.in(user._id).emit("new notification", notification);
            }
        });
    });

    //on typing, send typing event in the room to every user
    socket.on("typing", (room) => socket.in(room).emit("typing"));

    //on typing stopped, send typing stopped event in the room to every user
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    //disconnect socker
    socket.off("disconnect", () => {
        console.log("User disconnected");
        socket.leave(userData._id)
    })
})



