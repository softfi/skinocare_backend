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
import { autoSendMessageByBot, saveUserMessage } from "./helpers/helper.js";
import { getMessageList } from "./controllers/user/chatHistoryController.js";
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
//const httpServer = http.createServer(app);
 const httpsServer = https.createServer(credentials, app);


/* WEBSOCEKT ROUTE START */

const io = new Server(httpsServer);

io.use(userSocket); 

// Handle socket connections
var messageDetails ;
io.on('connection', async(socket) => { 

    socket.on('message', async(data) => {
        messageDetails= data;
        if(data?.message.length > 0){
            let receivedMessage = await saveUserMessage(socket.customerId , data.message, data.type, data.isImage);
        }
        let sendBotMessage = await autoSendMessageByBot(socket , data.type, (data?.message.length > 0));
        socket.emit('lastMessage', sendBotMessage);
        socket.emit('chatHistory', await getMessageList(socket.customerId, data.type));
    });
  //  socket.emit('lastMessage', await autoSendMessageByBot(socket, messageDetails?.type, false));
  //  socket.emit('chatHistory', await getMessageList(socket.customerId, messageDetails?.type));
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});



/* WEBSOCEKT ROUTE END */

//httpServer.listen(PORT,()=>{
  //  console.log(`Server is running on port ${PORT}`);
//});

 httpsServer.listen(PORT,()=>{
     console.log(`Server is running on port ${PORT}`);
 });
