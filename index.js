import express from "express";
import https from "https";
import http from "http";
import fs from "fs"; 
import { Server } from 'socket.io';
import bodyParser from "body-parser";
import { PORT } from "./config/config.js"
import database from "./config/database.js";   // Database Connection load
import { api } from "./routes/api.js";
import { userSocket } from "./middlewares/userAuthentication.js";
import { autoSendMessageByBot, errorResponse, getImageSingedUrlById, saveUserMessage } from "./helpers/helper.js";
import { getMessageList, getchatLists,getchatListsData } from "./controllers/user/chatHistoryController.js";
import Chat from "./models/Chat.js";
import Conversation from "./models/Conversation.js";
import User from "./models/User.js";
import { errorLog } from "./config/logger.js";
import Prescription from "./models/Prescription.js";
import Product from "./models/Product.js";
import kit from "./models/kit.js";
// import expressStatusMonitor from "express-status-monitor";
const app = express();

/***************
    MIDDLEWARE 
****************/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json());
// app.use(expressStatusMonitor());
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
app.get('*', (req, res)=>{
    res.status(404).send({status: false, msg: "Not Found"})
});

app.post('*', (req, res)=>{
    res.status(404).send({status: false, msg: "Not Found"})
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

// const io = new Server(httpsServer);
const io = new Server(httpsServer);

io.use(userSocket);  

// Handle socket connections
var messageDetails ;
io.on('connection', async (socket) => {
    let userId = socket?.customerId;
    await User.findOneAndUpdate({_id:userId},{$set: {socketId: socket?.id,online:true}});
    socket.on('message', async (data) => {
        messageDetails = data;
        if (data?.message?.length > 0) {
            let receivedMessage = await saveUserMessage(socket?.customerId, data?.message, data?.type, data?.isImage);
        }
        let sendBotMessage = await autoSendMessageByBot(socket, data?.type, data?.regenerateChat, data?.message, data?.userConcern, (data?.message?.length > 0));
        socket.emit('lastMessage', sendBotMessage);
        socket.emit('chatHistory', await getMessageList(socket?.customerId, data.type));
    });

    // Handle 'sendMessage' event 
    socket.on('sendMessage', async (data) => {
        try {
            const { message, receiverId, type, isImage } = data;
            const newChat = new Chat({
                message: message,
                senderId: socket?.customerId,
                receiverId,
                type,
                isImage,

            });

            // Save the chat message to the database
            const savedChat = await newChat.save();


            // Find or create the conversation between the sender and receiver
            let conversation = await Conversation.findOne({
                participants: { $all: [socket?.customerId, receiverId] }
            });

            if (!conversation) {
                conversation = new Conversation({
                    participants: [socket?.customerId, receiverId],
                    messages: []
                });
            }
            let extraData = '';
            if(type == 'prescription'){
                extraData = await Prescription.findById(message).select("title description");
            } else if (type == 'regimen') {
                extraData = await kit.findById(message).select("name image");
                extraData = {...extraData?._doc, image : await getImageSingedUrlById(extraData?.image)};
            } else if (type == 'product') {
                extraData = await Product.findById(message).select("name image slug");
                extraData = {...extraData?._doc, image : await getImageSingedUrlById(extraData?.image)};
            } else if (type == 'image') {
                extraData = { image : await getImageSingedUrlById(message)};
            }

            // Push the message ID into the messages array of the conversation
            conversation.messages.push(savedChat?._id);

            // Save the conversation to update the chat history
            await conversation.save();
            let recieverData = await User.findOne({_id:receiverId});
            // io.emit('receiveMessage', data);
            // Emit the message to the receiver's socket ID
            io.to(recieverData?.socketId).emit('receiveMessage', {...data,extraData:extraData});
            socket.emit('chatLists', await getchatLists(socket?.customerId))
            socket.emit('chatListsData', await getchatListsData(socket?.customerId))
            socket.to(recieverData?.socketId).emit('chatLists', await getchatLists(recieverData?._id))
            socket.to(recieverData?.socketId).emit('chatListsData', await getchatListsData(recieverData?._id))  
        } catch (error) {
            errorLog(error);
        }
    });
    socket.emit('chatLists', await getchatLists(socket?.customerId))
    socket.emit('chatListsData', await getchatListsData(socket?.customerId))


    // Handle the 'readMessage' event
    socket.on('readMessage', async ({ id }) => {
        try {
            let conversation = await Conversation.findOne({_id: id});
            if(conversation) {
                await Chat.updateMany({
                    _id: {$in:conversation?.messages},
                    receiverId: socket?.customerId,
                    isRead: false,
                    isDeleted: false
                },{$set:{isRead: true}});
            }
            // let unreadMessageCount = await Chat.countDocuments({
            //     _id: {$in:conversation?.messages},
            //     receiverId: socket?.customerId,
            //     isRead: false,
            //     isDeleted: false
            // });
            // const chatData = await Chat.findById({ _id: id, isDeleted: false });
            // chatData.isRead = true
            // await chatData.save();
            // Emit an acknowledgment to the sender
            socket.emit('messageRead', { messageId: id });
        } catch (error) {
            errorLog(error);
        }
    });

    // Handle the 'completeChat' event
    socket.on('completeChat', async ({ id }) => {
        try {
            await Conversation.findByIdAndUpdate(id, { status: 'complete' }, { new: true });
            // Emit event to notify users about chat completion
            io.emit('chatComplete', id);
        } catch (error) {
            errorLog(error);
        }
    });

    // Listen for 'typing' event from the client
    socket.on('typing', async ( isTyping ) => {
        try{
            let recieverData = await User.findOne({_id:isTyping?.receiverId});
            console.log('socket : ',recieverData?.socketId);
            io.to(recieverData?.socketId).emit('userTyping', isTyping?.isTyping);
        } catch (error) {
            errorLog(error);
        }
    });
    // Handle online event
    socket.on('online', async ( {isOnline} ) => {
        try {
            const user = await User.findOne({ socketId: socket?.id });
            if (user) {
                user.online = isOnline; // Set user online status
                await user.save();
                console.log(`User ${user.name} is now ${isOnline ? 'online' : 'offline'}`);
                socket.broadcast.emit('userOnline', { Id: user?._id, isOnline });
            }
        } catch (error) {
            errorLog(error);
        }
        
    });
    // Handle disconnection
    socket.on('disconnect', async () => {
        try {
            const user = await User.findOne({ socketId: socket?.id });
            if (user) {
                user.online = false; // Set user online status
                await user.save();
                console.log(`User ${user.name} is now offline`);
                socket.broadcast.emit('userOnline', { Id: user?._id, isOnline:false });
            }
        } catch (error) {
            errorLog(error);
        }
        // console.log('User disconnected');
    });
});

/* WEBSOCEKT ROUTE END */

// httpServer.listen(PORT,()=>{
//    console.log(`Server is running on port ${PORT}`);
// });

 httpsServer.listen(PORT,()=>{
     console.log(`Server is running on port ${PORT}`);
 });
