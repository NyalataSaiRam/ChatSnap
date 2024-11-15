const express = require('express');
require('dotenv').config();
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');

const { connectToDB } = require('./mongodbConnection');
const { signup, login } = require('./controllers/auth.controller');
const userRoute = require('./routes/user.router');
const messageRoute = require('./routes/message.route');
const { verifyUser } = require('./middlewares/authentication.middleware');
const Message = require('./models/message.model');
const User = require('./models/user.model');

let users = [];
let activeUsers = [];



const app = express();


// app.use(cors({
//     origin: 'https://chatsnapp.netlify.app/', // Allow only your frontend
//     methods: [ 'GET', 'POST' ],
//     allowedHeaders: [ 'Content-Type', 'Authorization' ]
// }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

const httpServer = http.createServer(app);
const io = socketio(httpServer, {
    cors: {
        origin: "https://chatsnapp.netlify.app/"
    }
});


// Middleware to authenticate users based on socket handshake
io.use((socket, next) => {
    const id = socket.handshake.auth._id;
    if (!id) {
        return next(new Error("invalid Id"));
    }

    socket.userId = id;
    next();
});


io.on('connection', (socket) => {

    for (let [ id, socket ] of io.of('/').sockets) {

        const isUserExists = users.find(u => u.uid === socket.userId);
        if (!isUserExists) {
            users.push({
                sid: id,
                uid: socket.userId
            });
            activeUsers.push(socket.userId);
        } else {
            users = users.map(u => {
                if (isUserExists.uid === u.uid) {
                    return { sid: id, uid: socket.userId };
                } else {
                    return u;
                }
            });
        }


    }

    socket.emit('users', users);
    socket.emit('active', activeUsers);






    socket.broadcast.emit('new user', {
        sid: socket.id,
        uid: socket.userId
    });

    socket.broadcast.emit('new active', socket.userId);

    socket.on('video call', (calleeId) => {
        // Find the user to call
        const calleeSocket = users.find(s => s.uid === calleeId);
        if (calleeSocket) {
            socket.to(calleeSocket.sid).emit('callEvent', socket.userId);

        } else {
            console.log('no callee');
        }

    });
    socket.on('audio call', (calleeId) => {
        // Find the user to call
        const calleeSocket = users.find(s => s.uid === calleeId);
        if (calleeSocket) {
            socket.to(calleeSocket.sid).emit('AudioCallEvent', socket.userId);

        } else {
            console.log('no callee');
        }

    });

    socket.on('reject call', (callerid) => {
        const callerSocket = users.find(s => s.uid === callerid);
        if (callerSocket) {
            socket.to(callerSocket.sid).emit('rejectCallEvent', socket.userId);
        } else {
            console.log(' no user');

        }
    });

    socket.on('answer call', (callerid) => {
        const callerSocket = users.find(s => s.uid === callerid);
        if (callerSocket) {
            socket.to(callerSocket.sid).emit('answerCallEvent', socket.userId);
        } else {
            console.log(' no user');

        }
    });
    socket.on('answer audio call', (callerid) => {
        const callerSocket = users.find(s => s.uid === callerid);
        if (callerSocket) {
            socket.to(callerSocket.sid).emit('answerAudioCallEvent', socket.userId);
        } else {
            console.log(' no user');

        }
    });

    socket.on('hangUpTheCall', (callerId) => {
        const callerSocket = users.find(s => s.uid === callerId);
        if (callerSocket) {
            socket.to(callerSocket.sid).emit('hangUpTheCallEvent', socket.userId);
        } else {
            console.log(' no user');

        }
    });



    socket.on('private message', async ({ content, to, receiverId }) => {
        console.log('private message emitted');

        try {

            if (to !== null) {

                const newMessage = await Message.create({
                    sender: socket.userId,
                    receiver: receiverId,
                    message: content,
                    read: true
                });



                socket.emit('private message', newMessage);
                socket.to(to).emit('private message', newMessage);
            } else {

                const newMessage = await Message.create({
                    sender: socket.userId,
                    receiver: receiverId,
                    message: content,
                    read: false
                });

                socket.emit('private message', newMessage);

            }


        } catch (err) {
            console.log(err);
        }


    });

    socket.on('disconnect', () => {
        users = users.filter(u => u.uid !== socket.userId);
        activeUsers = activeUsers.filter(u => u !== socket.userId);
        socket.broadcast.emit('user disconnected', users);
        socket.broadcast.emit('active disconnected', activeUsers);
    });

});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

try {
    connectToDB(process.env.MONGODB_CONN_STRING);
} catch (error) {
    console.log(error);
}

app.get('/', (req, res) => res.send('Hello, World!'));

app.post('/signup', signup);
app.post('/login', login);
app.use('/user', verifyUser, userRoute);
app.use('/message', verifyUser, messageRoute);

httpServer.listen(process.env.PORT, () => {
    console.log(`Connected on port no - ${process.env.PORT}`);
});
