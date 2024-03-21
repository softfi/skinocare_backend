import Razorpay from 'razorpay';
import { errorLog } from '../../config/logger.js';
import { authValues, errorResponse, responseWithData, responseWithoutData } from '../../helpers/helper.js';
import crypto from 'crypto';
import Order from '../../models/Order.js';
import OrderTransaction from '../../models/OrderTransaction.js';
import Transaction from '../../models/Transaction.js';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '../../config/config.js';
import Coupon from '../../models/Coupon.js';
import Cart from '../../models/Cart.js';


export const payment = async (req, res) => {
    try {
        let order = await Order.findOne({ _id: req?.body?.orderId });
        if (order == null) {
            return responseWithoutData(res, 201, false, "Order Id is invalid!!");
        }
        // let order = {_id:"65327bfe9e27d148f6f78ac8",grandTotal:100,shippingCost:50,tax:20}
        let customer = await authValues(req.headers['authorization']);
        const instance = new Razorpay({
            key_id: RAZORPAY_KEY_ID,
            key_secret: RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: Number(order?.grandTotal) * 100,
            currency: 'INR',
            receipt: crypto.randomBytes(10).toString("hex"),
            payment_capture: 1
        };


        instance.orders.create(options, async (error, payment) => {
            if (error) {
                errorLog(error);
                return errorResponse(res);
            }
            if (payment == null) {
                var transaction = await Transaction.create({
                    orderId: order?._id,
                    paymentId: payment.id,
                    payerId: customer._id,
                    paymentReceiptId: payment.receipt,
                    paymentMethod: 'razorpay',
                    paymentStatus: 'failed',
                    amount: Number(order?.grandTotal),
                    transactionType: 'online'
                });
                if (transaction) {
                    const orderTransaction = await OrderTransaction.create({
                        orderId: order?._id,
                        orderAmount: Number(order?.grandTotal),
                        paymentStatus: 'failed',
                        deliveryCharge: Number(order?.shippingCost),
                        tax: Number(order?.tax),
                        customerId: customer._id,
                        paymentMethod: 'razorpay',
                        transactionId: transaction._id
                    });
                    if (orderTransaction) {
                        const data = { ...payment, orderId: order?._id }
                        return responseWithData(res, 200, true, "Payment Created Successfully!!", data);
                    }
                }
                order?.orderDetails?.map(async (orderDetails) => {
                    await Cart.create({
                        customerId: customer?._id,
                        productId: orderDetails?.productId,
                        quantity: orderDetails?.quantity
                    });
                    await Coupon.updateOne({ code: order?.couponCode }, { $inc: { balanceLimit: 1 } });
                    await Order.findByIdAndUpdate(order?._id, { $set: { orderStatus: "cancelled" } });
                });
                return responseWithoutData(res, 201, false, "Something Went Wrong, Please Try Again");
            }
            else {
                var transaction = await Transaction.create({
                    orderId: order?._id,
                    paymentId: payment.id,
                    payerId: customer._id,
                    paymentReceiptId: payment.receipt,
                    paymentMethod: 'razorpay',
                    paymentStatus: 'pending',
                    amount: Number(order?.grandTotal),
                    transactionType: 'online'
                });
                if (transaction) {
                    const orderTransaction = await OrderTransaction.create({
                        orderId: order?._id,
                        orderAmount: Number(order?.grandTotal),
                        paymentStatus: 'pending',
                        deliveryCharge: Number(order?.shippingCost),
                        tax: Number(order?.tax),
                        customerId: customer._id,
                        paymentMethod: 'razorpay',
                        transactionId: transaction._id
                    });
                    if (orderTransaction) {
                        const data = { ...payment, orderId: order?._id, amount: Number(order?.grandTotal),currency: 'INR',name: customer.name,description: "I am "+customer.name+" and I am Completing the Payment of Order.",
                            email: customer.email,mobile: customer.mobile}
                        return responseWithData(res, 200, true, "Payment Created Successfully!!", data);
                    }
                }
            }
            return responseWithoutData(res, 201, false, "Something Went Wrong!!");
        });

    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}


/* OPTIMIZE FUNCTION */

// export const payment = async (req, res) => {
//     try {
//         const order = await Order.findOne({ _id: req?.body?.orderId });

//         if (!order) {
//             return responseWithoutData(res, 400, false, "Invalid Order Id");
//         }

//         const customer = await authValues(req.headers['authorization']);

//         const paymentOptions = {
//             amount: Number(order?.grandTotal) * 100,
//             currency: 'INR',
//             receipt: crypto.randomBytes(10).toString("hex"),
//         };
        
//         const instance = new Razorpay({
//             key_id: RAZORPAY_KEY_ID,
//             key_secret: RAZORPAY_KEY_SECRET,
//         });

//         const createPayment = async () => {
//             return new Promise((resolve, reject) => {
//                 instance.orders.create(paymentOptions, (error, payment) => {
//                     if (error) {
//                         errorLog(error);
//                         reject(error);
//                     } else {
//                         resolve(payment);
//                     }
//                 });
//             });
//         };

//         const payment = await createPayment();

//         const processPayment = async (paymentStatus) => {
//             // Create transaction
//             const transaction = await Transaction.create({
//                 orderId: order._id,
//                 paymentId: payment.id,
//                 payerId: customer._id,
//                 paymentReceiptId: payment.receipt,
//                 paymentMethod: 'razorpay',
//                 paymentStatus,
//                 amount: Number(order?.grandTotal),
//                 transactionType: 'online'
//             });

//             // Create order transaction
//             const orderTransaction = await OrderTransaction.create({
//                 orderId: order._id,
//                 orderAmount: Number(order?.grandTotal),
//                 paymentStatus,
//                 deliveryCharge: Number(order?.shippingCost),
//                 tax: Number(order?.tax),
//                 customerId: customer._id,
//                 paymentMethod: 'razorpay',
//                 transactionId: transaction._id
//             });

//             return { transaction, orderTransaction };
//         };

//         if (payment) {
//             const { transaction, orderTransaction } = await processPayment('pending');
//             const data = { ...payment, orderId: order._id };
//             return responseWithData(res, 200, true, "Payment Created Successfully!!", data);
//         } else {
//             // Handle the case where payment fails
//             // Rollback operations or handle accordingly
//             return responseWithoutData(res, 400, false, "Payment Failed");
//         }
//     } catch (error) {
//         errorLog(error);
//         return errorResponse(res);
//     }
// };


export const paymentVerify = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req?.body;
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");
        if (razorpay_signature === expectedSign) {
            let transaction = await Transaction.findOne({ paymentId: razorpay_order_id });
            if (transaction == null) {
                return responseWithoutData(res, 404, false, "No Transaction Found!!");
            } else {
                await Transaction.findOneAndUpdate({ paymentId: razorpay_order_id }, { $set: { orderPaymentId: razorpay_payment_id, paymentStatus: "success" } });
                await OrderTransaction.findOneAndUpdate({ transactionId: transaction?._id }, { $set: { status: "success" } });
                await Order.findOneAndUpdate({ _id: transaction?.orderId }, {
                    $set: { paymentStatus: "success" }
                });
                return responseWithoutData(res, 200, true, "Payment has been done Successfully!!");
            }
        } else {
            return responseWithoutData(res, 404, false, "Invalid Signature!!");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}


export const failedPayment = async (req, res) => {
    try {
        let customer = await authValues(req.headers['authorization']);
        let order = await Order.findOne({ _id: req?.body?.orderId, customerId: customer?._id });
        if (order) {
            order?.orderDetails?.map(async (orderDetails) => {
                await Cart.create({
                    customerId: customer?._id,
                    productId: orderDetails?.productId,
                    quantity: orderDetails?.quantity
                });
            });
            await Coupon.updateOne({ code: order?.couponCode }, { $inc: { balanceLimit: 1 } });
            await Order.findByIdAndUpdate(order?._id, { $set: { orderStatus: "cancelled" } });
            return responseWithoutData(res, 201, true, "Payment Failed!!");
        } else {
            return responseWithoutData(res, 201, false, "Order Id is Invalid!!");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}