import express from "express";
import https from "https";
import http from "http";
import fs from "fs";
import { Server } from 'socket.io';
import bodyParser from "body-parser";
import { PORT, } from "./config/config.js"
import database from "./config/database.js";   // Database Connection load
import { api } from "./routes/api.js";
import { userSocket } from "./middlewares/userAuthentication.js";
import { autoSendMessageByBot, saveUserMessage } from "./helpers/helper.js";
import { getMessageList, getchatLists } from "./controllers/user/chatHistoryController.js";
import Conversation from "./models/Conversation.js";
import Chat from "./models/Chat.js";
const app = express();

/***************
    MIDDLEWARE 
****************/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api', api);

/*********************
    SSL CERTIFICATE 
**********************/

const privateKey = fs.readFileSync('./ssl/credentials/privekey.pem', 'utf8');
const certificate = fs.readFileSync('./ssl/credentials/cert.pem', 'utf8');
const chain = fs.readFileSync('./ssl/credentials/chain.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: chain
};


/* Not Fround Handler 404 */
app.get('*', (req, res) => {
    res.status(404).send({ status: false, msg: "Not Found" })
});

app.post('*', (req, res) => {
    res.status(404).send({ status: false, msg: "Not Found" })
});


/**********************
   APPLICATION LISTER
***********************/
// app.listen(PORT,()=>{
//     console.log(`Server is running on port ${PORT}`);
// });

/********************************************
    APPLICATION LISTER HTTP & HTTPS SERVERS
*********************************************/
// Starting both http & https servers
// const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);



/* WEBSOCEKT ROUTE START */

const io = new Server(httpsServer);

// const io = new Server(httpServer);


io.use(userSocket);

// Handle socket connections                                                                                                                                                                                                                                                                                                                                                           
var messageDetails;
io.on('connection', async (socket) => {

    socket.on('message', async (data) => {
        messageDetails = data;
        if (data?.message.length > 0) {
            let receivedMessage = await saveUserMessage(socket.customerId, data.message, data.type, data.isImage);
        }
        let sendBotMessage = await autoSendMessageByBot(socket, data.type, data?.regenerateChat, data.message, data?.userConcern, (data?.message.length > 0));
        socket.emit('lastMessage', sendBotMessage);
        socket.emit('chatHistory', await getMessageList(socket.customerId, data.type));
    });
    // socket.emit('lastMessage', await autoSendMessageByBot(socket, messageDetails?.type, false));
    // socket.emit('chatHistory', await getMessageList(socket.customerId, messageDetails?.type));

    // Handle 'sendMessage' event 
    socket.on('sendMessage', async (data) => {
        try {
            const { message, senderId, receiverId, type, isImage } = data;
            const newChat = new Chat({
                message: type === 'prescription' ? message.prescriptionId : type === 'regimen' ? message.regimenId : message,
                senderId: socket.type === 'doctor' ? socket.doctorId : socket.customerId,
                receiverId,
                type,
                isImage,

            });

            // Save the chat message to the database
            const savedChat = await newChat.save();


            // Find or create the conversation between the sender and receiver
            let conversation = await Conversation.findOne({
                participants: { $all: [senderId, receiverId] }
            });

            if (!conversation) {
                conversation = new Conversation({
                    participants: [senderId, receiverId],
                    messages: []
                });
            }

            // Push the message ID into the messages array of the conversation
            conversation.messages.push(savedChat._id);

            await conversation.save();

            // io.emit('receiveMessage', data);
            // Emit the message to the receiver's socket ID
            io.to(receiverId).emit('receiveMessage', data);

            socket.emit('chatLists', await getchatLists(socket.doctorId, socket.customerId))

        } catch (error) {
            errorResponse(error);
        }
    });

    // Handle the chat list event
    // socket.on('chatLists', async () => {

    //     try {
    //         let chats = await Chat.find({
    //             $or: [
    //                 { senderId: socket.doctorId },
    //                 { receiverId: socket.customerId }
    //             ],
    //             isDeleted: false
    //         }).populate('senderId receiverId').sort({ createdAt: -1 });
    //         // Emit the retrieved chat messages to the client-side application
    //         socket.emit('chatLists', chats);
    //     } catch (error) {
    //         // errorResponse(error);
    //         console.log(error)
    //     }
    // });

    // Handle the 'readMessage' event
    socket.on('readMessage', async ({ id }) => {
        try {
            const chatData = await Chat.findById({ _id: id, isDeleted: false });
            chatData.isRead = true
            await chatData.save()
            // Emit an acknowledgment to the sender
            socket.emit('messageRead', { messageId: id });
        } catch (error) {
            errorResponse(error);
        }
    });

    // Handle the 'completeChat' event
    socket.on('completeChat', async ({ id }) => {
        try {
            await Conversation.findByIdAndUpdate(id, { status: 'complete' }, { new: true });
            // Emit event to notify users about chat completion
            io.emit('chatComplete', id);
        } catch (error) {
            errorResponse(error);
        }
    });

    // Listen for 'typing' event from the client
    socket.on('typing', ({ isTyping }) => {

        socket.broadcast.emit('userTyping', { Id: socket.type === 'doctor' ? socket.doctorId : socket.customerId, isTyping });
    });
    // Handle online event
    socket.on('online', ({ isOnline }) => {

        socket.broadcast.emit('userOnline', { Id: socket.type === 'doctor' ? socket.doctorId : socket.customerId, isOnline });
    });
    // Handle offline event
    socket.on('offline', () => {

        socket.broadcast.emit('userOnline', { Id: socket.type === 'doctor' ? socket.doctorId : socket.customerId, isOnline: false });
    });
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

/* WEBSOCEKT ROUTE END */




// httpServer.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

httpsServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

