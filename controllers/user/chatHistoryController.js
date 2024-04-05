import { errorLog } from "../../config/logger.js";
import { authValues, errorResponse, getImageSingedUrlById, responseWithData, responseWithoutData, sendPushNotification } from "../../helpers/helper.js";
import Chat from "../../models/Chat.js";
import ChatbotMessage from "../../models/ChatbotMessage.js";
import Message from "../../models/Message.js";
import Order from "../../models/Order.js";
import Prescription from "../../models/Prescription.js";
import kit from "../../models/kit.js";

export const getMessageList = async (customerId, type) => {
  try {
    let messages = await Message.find({ customerId, type }).
      select(
        "message customerId  isSendByBot isImage createdAt"
      ).
      sort({ createdAt: -1 });
    let messageList = [];
    for (let message of messages) {
      if (message.isImage) {
        messageList.push({ ...message._doc, message: await getImageSingedUrlById(message.message) });
      } else {
        messageList.push({ ...message._doc });
      }
    }
    return messageList;
  } catch (error) {
    errorLog(error);
  }
};

export const previousChat = async (req, res) => {
  try {
    let user = await authValues(req.headers["authorization"]);
    let hairmessages = await Message.find({ customerId: user?._id, type: "hair" }).count();
    let skinmessages = await Message.find({ customerId: user?._id, type: "skin" }).count();
    let hairbotMessage = await Message.findOne({ customerId: user?._id, isSendByBot: true, type: "hair" }).sort({ createdAt: -1 });
    let skinbotMessage = await Message.findOne({ customerId: user?._id, isSendByBot: true, type: "skin" }).sort({ createdAt: -1 });
    if (hairbotMessage) {
      hairbotMessage = await ChatbotMessage.findOne({ _id: hairbotMessage?.botMessageId });
    }
    if (skinbotMessage) {
      skinbotMessage = await ChatbotMessage.findOne({ _id: skinbotMessage?.botMessageId });
    }
    let hairOrder = await Order.findOne({ isKit: true, kitId: user?.hairKitId, customerId: user._id, $or: [{ paymentMethod: 'cod' }, { paymentMethod: 'online', paymentStatus: 'paid' }] });
    let skinOrder = await Order.findOne({ isKit: true, kitId: user?.skinKitId, customerId: user._id, $or: [{ paymentMethod: 'cod' }, { paymentMethod: 'online', paymentStatus: 'paid' }] });
    return responseWithData(res, 200, true, "Previous Chat has been Check Successfully!!", {
      hairchatHistory: (hairmessages > 0 && (hairbotMessage && !hairbotMessage?.isExit) && hairOrder == null) ? true : false,
      skinchatHistory: (skinmessages > 0 && (skinbotMessage && !skinbotMessage?.isExit) && skinOrder == null) ? true : false
    });
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
}

export const sendChatNotification = async (req, res) => {
  try {
    let user = await authValues(req.headers["authorization"]);
    await sendPushNotification(user?._id, `Your ${req?.body?.type} chat is incomplete - SkinOcare`, `Hello ${user?.name}, Your doctor is waiting for some answers to create right treatment kit for you.`, "", "/chatNotification");
    return responseWithoutData(res, 200, true, "Chat Notification has been send Successfully!!");
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
}

export const getchatLists = async (customerId) => {
  try {
    let chats = await Chat.find({
      $or: [
        { senderId: customerId },
        { receiverId: customerId }
      ],
      isDeleted: false
      // }).populate('senderId receiverId').sort({ createdAt: -1 })
    }).populate({
      path: 'senderId',
      select: '-deviceId -hairOptCall -skinOptCall -isEmailVerify -isMobileVerify -hairKitId -hairKitGenDate -hairDoctor -hairConcern -skinKitId -skinKitGenDate -skinDoctor -skinConcern -emailOtp -referralCode -gender -age -feedback'
    })
      .populate({
        path: 'receiverId',
        select: '-deviceId -hairOptCall -skinOptCall -isEmailVerify -isMobileVerify -hairKitId -hairKitGenDate -hairDoctor -hairConcern -skinKitId -skinKitGenDate -skinDoctor -skinConcern -emailOtp -referralCode -gender -age -feedback'
    }).limit(50).sort({ createdAt: -1 });
    let messageList = [];

    for (let chat of chats) {
      let senderImageUrl = null;
      let receiverImageUrl = null;

      if (chat?.senderId?.image) {
        senderImageUrl = await getImageSingedUrlById(chat?.senderId?.image);
      }

      if (chat?.receiverId?.image) {
        receiverImageUrl = await getImageSingedUrlById(chat?.receiverId?.image);
      }
      let extraData = '';
      if(chat?.type == 'prescription'){
        extraData = await Prescription.findById(chat?.message).select("title description");
      } else if (chat?.type == 'regimen') {
          extraData = await kit.findById(chat?.message).select("-isActive -createdAt -updatedAt");
          extraData = {...extraData?._doc, image : await getImageSingedUrlById(extraData?.image)};
      }

      messageList.push({
        ...chat._doc,
        senderImageUrl,
        receiverImageUrl,
        extraData
      });
    }
    // console.log("data", messageList)
    // Calculate the count of unread messages
    let unreadMessageCount = await Chat.countDocuments({
      $or: [
        { senderId: customerId, isRead: false },
        { receiverId: customerId, isRead: false }
      ],
      isDeleted: false
    });
    return { messageList, unreadMessageCount };
  } catch (error) {
    errorLog(error);

  }
};