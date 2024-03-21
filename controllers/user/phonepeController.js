import crypto from "crypto";
import {
  PHONEPE_CALLBACK_URL,
  PHONEPE_MERCHANT_ID,
  PHONEPE_REDIRECT_URL,
  PHONEPE_SALT_KEY,
} from "../../config/config.js";
import axios from "axios";
import { errorLog } from "../../config/logger.js";
import {
  errorResponse,
  responseWithData,
  responseWithoutData,
  sendPushNotification,
} from "../../helpers/helper.js";
import User from "../../models/User.js";
import Order from "../../models/Order.js";
import OrderTransaction from "../../models/OrderTransaction.js";
import ShippingAddress from "../../models/ShippingAddress.js";
import Cart from "../../models/Cart.js";
import { addShiprocketOrder } from "./shiprocketController.js";

export const createPayment = async (req, res) => {
  try {
    let order = await Order.findById(req.body.orderId);
    let name = req?.body?.name;
    if (order) {
      let customer = await User.findById(order.customerId);
      const shipmentAddress = await ShippingAddress.findById(
        order?.shippingAddressId
      );
      const data = {
        amount: Number(Number(order.grandTotal)?.toFixed(2) * 100),
        // amount: 100,
        mobileNumber: shipmentAddress?.phone,
        phonepay_merchant_id: PHONEPE_MERCHANT_ID,
        phonepay_redirect_url: PHONEPE_REDIRECT_URL + "payment/status",
        phonepay_callback_url:
          PHONEPE_CALLBACK_URL + "api/web/phonepe/callback-url/" + order._id,
        salt_key: PHONEPE_SALT_KEY,
        environment: "production",
        name: shipmentAddress?.name,
      };
      const prod_URL = "https://payments.jurysoftprojects.com/phonepay/payment";
      const options = {
        method: "POST",
        url: prod_URL,
        data: data,
      };
      axios
        .request(options)
        .then(async (response) => {
          let orderTransaction = await OrderTransaction.create({
            orderId: order._id,
            orderAmount: order.grandTotal,
            paymentStatus: "pending",
            deliveryCharge: order.shippingCost,
            tax: order.tax,
            customerId: order.customerId,
            paymentMethod: order.paymentMethod,
            transactionId: response.data.merchantTransactionId,
          });
          order.transactionNo = response.data.merchantTransactionId;
          if (await order.save()) {
            let resData = {
              transactionId: response.data.merchantTransactionId,
              paymentUrl:
                response.data.data.instrumentResponse.redirectInfo.url,
            };
            return responseWithData(
              res,
              200,
              true,
              "Payment Created Successfully",
              resData
            );
          }
          return responseWithoutData(res, 403, false, "Something went Wrong");
        })
        .catch(function (error) {
          errorLog(error);
          return responseWithoutData(
            res,
            403,
            false,
            "Something went Wrong In Phone Pe API"
          );
        });
    } else {
      return responseWithoutData(res, 404, false, "Order Not Found");
    }
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
};

export const callback_url = async (req, res) => {
  try {
    console.log(req);
    let order = await Order.findById(req.params.orderId);
    let orderTransaction = await OrderTransaction.findOne({
      orderId: req.params.orderId,
    });
    console.log(order);
    order.paymentStatus = "paid";
    orderTransaction.paymentStatus = "success";
    if ((await order.save()) && (await orderTransaction.save())) {
      res.status(200).send({
        status: true,
      });
    } else {
      errorLog({
        error: "Transaction",
        order: req.params.orderId,
      });
    }
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
};

export const checkStatus = async (req, res) => {
  try {
    const phonepay_merchant_id = PHONEPE_MERCHANT_ID;
    const phonepay_transaction_id = req?.body?.transactionId;
    const salt_key = PHONEPE_SALT_KEY;

    const keyIndex = 1;
    const path = `/pg/v1/status/${phonepay_merchant_id}/${phonepay_transaction_id}`;
    const stringToHash = path + salt_key;
    const hash = crypto
      .createHash("sha256")
      .update(stringToHash, "utf-8")
      .digest("hex");
    const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1";
    const response = await axios.get(
      `${prod_URL}/status/${phonepay_merchant_id}/${phonepay_transaction_id}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-VERIFY": `${hash}###${keyIndex}`,
          "X-MERCHANT-ID": phonepay_merchant_id,
        },
      }
    );
    const responseData = response.data;
    const responseStatus = responseData?.code;
    let order = await Order.findOne({ transactionNo: phonepay_transaction_id });
    const userDetails = await User.findById(order?.customerId);
    let orderTransaction = await OrderTransaction.findOne({
      orderId: order?._id,
    });
    if (responseStatus == "PAYMENT_SUCCESS") {
      order.paymentStatus = "paid";
      orderTransaction.paymentStatus = "success";
      await sendPushNotification(order?.customerId,"Payment Confirmation - SkinOcare",`Hello ${userDetails?.name}, Your payment for SkinOcare order ${order?.orderNo} has been successfully processed. Thank you for your purchase! If you have any questions, please contact our support team.`,"","/payment");
      await sendPushNotification(order?.customerId,"Order Confirmed - SkinOcare",`Hello ${userDetails?.name}, Thank you for shopping with SkinOcare! Your order ${order?.orderNo} has been confirmed. You can track your order status in your account.`,"","/order");

      /**GENERATE*THE*ORDER*IN*SHIPROCKET**/
      let shiprocket = await addShiprocketOrder(order);
      order.shiprocketDetails = shiprocket;
      // /***********************************/
      let shippingAddress = await ShippingAddress.findById(order.shippingAddressId);

      /*  Email Notification to Admin Block Start */
      let body = "Dear Admin, <br> <br> Good news! A new order has been placed. Here are the details:<br><br>Order ID: " + order?.orderNo + "<br>Customer: " + customer?.name + "<br>Delivery Address: " + shippingAddress?.district + "," + shippingAddress?.state + " - " + shippingAddress?.pincode + "<br>Order Total: " + order?.grandTotal + "";
      let subject = "New Order Received";
      let toEmail = "skin0care224@gmail.com";         // Dynamic After Admin Panel Complete

      emailNotification(toEmail, subject, body);

    } else if (
      responseStatus == "PAYMENT_PENDING" ||
      responseStatus == "TRANSACTION_NOT_FOUND"
    ) {
      addToCart(order);
      order.paymentStatus = "unpaid";
      orderTransaction.paymentStatus = "pending";
    } else if (
      responseStatus == "PAYMENT_CANCELLED" ||
      responseStatus == "PAYMENT_DECLINED" ||
      responseStatus == "PAYMENT_ERROR"
    ) {
      order.paymentStatus = "unpaid";
      orderTransaction.paymentStatus = "failed";
      addToCart(order);
    } else {
      addToCart(order);
      order.paymentStatus = "unpaid";
      orderTransaction.paymentStatus = "failed";
    }
    if ((await order.save()) && (await orderTransaction.save())) {
      res.status(200).send({
        status: true,
        status: "success",
        message: "Data fetched successfully",
        data: responseData,
      });
    } else {
      errorLog({
        error: "Transaction",
        order: req.params.orderId,
      });
    }
  } catch (error) {
    console.error(error);
    res.send({
      status: "error",
      message: error.message,
    });
  }
};

const addToCart = async (order) => {
  order?.orderDetails?.map(async (item, index) => {
    let cart = await Cart.create({
      customerId: order?.customerId,
      productId: item.productId,
      quantity: item.quantity,
    });
  });
};
